<?php

namespace App\Repositories;

use App\Models\User;


class BookRepository extends DatabaseRepository
{
    private \PDO $pdo;

    public function __construct()
    {
        parent::__construct();
        $this->pdo = $this->getConnection();
    }

  
}
