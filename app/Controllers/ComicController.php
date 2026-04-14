<?php

namespace App\Controllers;
use App\Repositories\ComicRepository;

class ComicController extends Controller
{
    private ComicRepository $repo;

    public function __construct()
    {
        parent::__construct();
        $this->repo = new ComicRepository();
    }

    public function create()
    {
        return $this->pageLoader->setLayout('main')->setPage('addComics')->render(['page' => 'Add Comic']);
    }

    public function store()
    {
        if (!empty($_POST['title'])) {
            $this->repo->create(
                $_POST['serie'] ?? null,
                $_POST['number'] ?? null,
                $_POST['title'],
            );
        }

        header('Location: /comics');
        exit;
    }
}