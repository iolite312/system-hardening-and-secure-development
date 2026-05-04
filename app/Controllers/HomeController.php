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
    private $maxPage = 0;
    private $minPage = 0;
    private $offset = 0;
    private $limit = 100;
    private $maxRecords;

    public function __construct()
    {
        parent::__construct();
        $this->bookRepository = new BookRepository();
        $this->currentPage = $this->getCurrentPageFromRequest();
        $this->maxRecords = $this->bookRepository->countComics();
        $this->maxPage = max(0, (int) floor(($this->maxRecords - 1) / $this->limit));
        $this->currentPage = min($this->currentPage, $this->maxPage);

        if (isset($_POST["pagination"])) {
            switch ($_POST["pagination"]) {
                case 'prev':
                    $this->PrevPage();
                    break;
                case 'next':
                    $this->NextPage();
                    break;
                case 'last':
                    $this->LastPage();
                    break;
                case 'first':
                    $this->FirstPage();
                    break;
            }
        }

        $this->main();
    }

    private function getCurrentPageFromRequest(): int
    {
        if (isset($_POST['currentPage']) && is_numeric($_POST['currentPage'])) {
            return max(0, (int) $_POST['currentPage']);
        }

        return 0;
    }

    private function main()
    {
        $this->offset = $this->currentPage * $this->limit;
        $this->books = $this->bookRepository->getAmountOfComics($this->limit, $this->offset);
    }

    public function index()
    {
        return $this->pageLoader->setLayout('main')->setPage('home')->render([
            'page' => 'Home',
            'books' => $this->books,
            'currentPage' => $this->currentPage,
            'maxPage' => $this->maxPage,
        ]);
    }

    public function NextPage()
    {
        if ($this->currentPage < $this->maxPage) {
            $this->currentPage++;
        }
    }

    public function PrevPage()
    {
        if ($this->currentPage > $this->minPage) {
            $this->currentPage--;
        }
    }

    public function FirstPage(){
        $this->currentPage = 0;
    }
     public function LastPage(){
        $this->currentPage = $this->maxPage;
    }
}
