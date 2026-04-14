<?php

namespace App\Controllers;

use App\Enums\ResponseEnum;
use App\Application\Request;
use App\Application\Session;
use App\Application\Response;
use App\Repositories\LoginRepository;

class HomeController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->loginRepository = new LoginRepository();
    }
    public function index()
    {
        return $this->pageLoader->setLayout('main')->setPage('home')->render(['page' => 'Home']);
    }

}
