<?php
namespace Layout;

class User extends \LiesController {
  public function __construct () {
    parent::__construct();
  }
  public function index () {
    $this->render();
  }
}