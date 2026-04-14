<?php

namespace App\Controllers;

use App\Enums\ResponseEnum;
use App\Application\Request;
use App\Application\Session;
use App\Application\Response;
use App\Repositories\LoginRepository;

class HomeController extends Controller
{
    public function index()
    {
        return $this->pageLoader->setLayout('main')->setPage('home')->render(['page' => 'Home']);
    }
}
