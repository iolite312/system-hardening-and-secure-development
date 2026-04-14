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

    public function create(string $title, ?string $serie, ?int $number): void
    {
        $stmt = $this->pdo->prepare("
        INSERT INTO comics (title, serie, number)
        VALUES (:title, :serie, :number)
    ");

        $stmt->execute([
            'title' => $title,
            'serie' => $serie,
            'number' => $number
        ]);
    }
}