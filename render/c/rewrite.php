<?php
namespace Tool;

class Rewrite {
    private $rules = [];
    private $url = '';

    public function __construct ($url, $rules = [])
    {   
        $this->url = $url ? $url : '/';
        $this->rules = $rules;
    }

    private function rewrite ()
    {   
        $rules = $this->rules;
        $url = $this->url;

        if ($url == '/') {
            return $rules[$url] ? $rules[$url] : $url;
        } else {
            $trimUrl = trim($url, '/');
            foreach ($rules as $key => $value) {
                if (trim($key, '/') == $trimUrl) {
                    return $value;
                }
            }
            return '/' + $trimUrl;
        }
    }

    public function res ()
    {
        $trimUrl = trim($this->rewrite(), '/');
        $chips = explode('/', $trimUrl);
        $controller = $chips[0] ? $chips[0] : 'Index';
        $method = $chips[1] ? $chips[1] : 'index';
        return [$controller, $method];
    }
}