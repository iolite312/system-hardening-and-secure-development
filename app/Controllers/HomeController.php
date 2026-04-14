<?php

namespace App\Controllers;
use App\Application\Request;
use App\Application\Session;
use App\Application\Response;
use App\Repositories\BookRepository;

class HomeController extends Controller{

    private BookRepository $bookRepository;

    public function __construct(){
        parent::__construct();
        $this->bookRepository = new BookRepository();
    }
     public function index()
    {
        return $this->pageLoader->setLayout('login')->setPage('Home')->render(['page' => 'login']);
    } 
}
