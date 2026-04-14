<?php

namespace App\Repositories;

use PDO;

class UserRepository extends DatabaseRepository
{
    private PDO $pdo;

    public function __construct()
    {
        parent::__construct();
        $this->pdo = $this->getConnection();
    }

    public function create(string $email, string $password, string $salt, string $role): void
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO users (email, password, salt, role)
            VALUES (:email, :password, :salt, :role)
        ");

        $stmt->execute([
            'email' => $email,
            'password' => $password,
            'salt' => $salt,
            'role' => $role
        ]);
    }
}