<?php
namespace Components;

class Component {
  protected $hash = '';
  private $component = [
    'suffix' => [
      'template' => '.te.html',
      'style' => '.st.html',
      'script' => '.sc.html',
    ],
  ];
  public function bodyPack ($path, $type) {
    $existsVersionDir = file_exists(CACHES_PATH . '/' . VERSION_ID);
    if (!$existsVersionDir) {
      mkdir(CACHES_PATH . '/' . VERSION_ID);
    }
    $suffix = $this->component['suffix'][$type];

    $path = COMPONENT_PATH . '/' . trim($path, '/') . '.html';
    $pathHash = hash('md5', VERSION_ID . $path);
    $pathMd5Hash = CACHES_PATH . '/' . VERSION_ID . '/' . $pathHash . $suffix;

    $this->hash = substr($pathHash, 0, 4);

    $existsPathMd5Hash = file_exists($pathMd5Hash);
    if (!$existsPathMd5Hash || DEVELOP_MODE) {
      $component = file_get_contents($path);
      preg_match('/<' . $type . '([\w\W]*)>([\w\W]*)<\/' . $type . '>/iU', $component, $match);
      $inner = trim($match[2]);
      switch ($type) {
        case 'style':
          $inner = preg_replace('/[ ]{0,}\{/', '[lies-id-' . $this->hash . ']{', $inner);
          $inner = preg_replace('/(@.*)\[.*\](.*\{)/', '$1$2', $inner);
          break;
        case 'script':
          $inner = preg_replace_callback('/new Refs\([a-z0-9]+?\)/i', function ($match) {
            return str_replace(')', ',\'' . $this->hash .'\')', $match[0]);
          }, $inner);
      }
      file_put_contents($pathMd5Hash, $inner);
    }
    
    return $pathMd5Hash;
  }
}

class Template extends Component {
  public function assign ($path) {
    $templateMd5Hash = parent::bodyPack($path, 'template');
    $template = $this;
    $hash = $this->hash;
    include($templateMd5Hash);
  }
}
class Script extends Component {
  public function assign ($path) {
    $scriptMd5Path = parent::bodyPack($path, 'script');
    $script = $this;
    echo '(function () {';
    echo '\'use strict\';';
    $hash = $this->hash;
    include($scriptMd5Path);
    echo '})();';
  }
}
class Style extends Component {
  public function assign ($path) {
    $styleMd5Path = parent::bodyPack($path, 'style');
    $style = $this;

    include($styleMd5Path);
  }
}

class Layout {
  private $template = [];
  private $script = [];
  private $style = [];

  public function __construct () {
    $this->template = new Template();
    $this->script = new Script();
    $this->style = new Style();
  }

  public function render ($path = '') {
    $template = $this->template;
    $script = $this->script;
    $style = $this->style;

    $componentPath = '';
    if ($path) {
      $componentPath = COMPONENT_PATH . '/' . trim($path, '/') . '.html';
    } else {
      $backtrace = debug_backtrace();
      $chips = explode('\\', $backtrace[1]['class']);
      $callClass = $chips[count($chips) - 1];
      $callMethod = $backtrace[1]['function'];
      $componentPath = COMPONENT_PATH . '/' . $callClass . '/' . $callMethod . '.html';
    }
    include($componentPath);
  }
}
