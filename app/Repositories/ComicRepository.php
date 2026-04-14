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

    public function create(?string $serie, ?int $number, string $title): void
    {
        $stmt = $this->pdo->prepare("
        INSERT INTO comics (serie, number, title)
        VALUES (:serie, :number, :title)
    ");

        $stmt->execute([
            'serie' => $serie,
            'number' => $number,
            'title' => $title
        ]);
    }
}