<?php
namespace Layout;

class Product extends \LiesController {
  public function __construct () {
    parent::__construct();
  }
  public function index () {
    $this->render();
  }
}