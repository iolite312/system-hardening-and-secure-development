<?php
namespace App\Repositories;
use PDO;

class ComicRepository extends DatabaseRepository
{
    private \PDO $pdo;

    public function __construct()
    {
        parent::__construct();
        $this->pdo = $this->getConnection();
    }

    public function create(string $title): void
    {
        $stmt = $this->pdo->prepare("INSERT INTO comics (title) VALUES (:title)");
        $stmt->execute([
            'title' => $title
        ]);
    }
}