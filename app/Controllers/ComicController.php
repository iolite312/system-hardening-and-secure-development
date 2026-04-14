<?php

namespace App\Controllers;
use App\Repositories\ComicRepository;

class ComicController
{
    private ComicRepository $repo;

    public function __construct()
    {
        $this->repo = new ComicRepository();
    }

    public function create()
    {
        require __DIR__ . '/../views/addComics.php';
    }

    public function store()
    {
        if (!empty($_POST['title'])) {
            $this->repo->create($_POST['title']);
        }

        header('Location: /comics');
        exit;
    }
}