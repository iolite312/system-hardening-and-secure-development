<?php

namespace App\Repositories;

use App\Models\User;
use App\Models\Book;


class BookRepository extends DatabaseRepository
{
    private \PDO $pdo;

    public function __construct()
    {
        parent::__construct();
        $this->pdo = $this->getConnection();
    }

    public function getAllComics(): array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM comics');
        $stmt->execute();
        $results = $stmt->fetchAll(\PDO::FETCH_ASSOC); // Fetch results into $results
        return array_map(fn($comic) => new Book($comic), $results); // Map results to Book instances
    }
}
