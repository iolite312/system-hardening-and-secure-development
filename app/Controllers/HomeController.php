<?php

namespace App\Controllers;

use App\Enums\ResponseEnum;
use App\Application\Request;
use App\Application\Session;
use App\Application\Response;
use App\Repositories\BookRepository;

class HomeController extends Controller
{
    private BookRepository $bookRepository;
    private $books = array();
    private $currentAmount = array();
    private $currentPage = 0;
    private $offset = 15;
    public function __construct()
    {
        parent::__construct();
        $this->bookRepository = new BookRepository();
        $this->books = $this->bookRepository->getAllComics();
        if(isset($_POST->pagination)){
            echo $_POST->pagination;
        }

    }
    public function index()
    {
        return $this->pageLoader->setLayout('main')->setPage('home')->render(['page' => 'Home', 'books' => $this->books,'currentPage'=>$this->currentPage]);
    }

    

    public function NextPage(){

      

    }
    public function PrevPage(){

    }
}
