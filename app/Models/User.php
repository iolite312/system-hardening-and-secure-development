<?php

namespace App\Models;

class User
{
    public int $id;
    public string $email;

    public function __construct($id, $email)
    {
        $this->id = $id;
        $this->email = $email;
    }

    public static function fromDatabase(array $user): self
    {
        return new self(
            $user['id'],
            $user['email'],
        );
    }
}
