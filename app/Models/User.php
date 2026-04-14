<?php

namespace App\Models;

use App\Enums\RolesEnum;

class User
{
    public int $id;
    public string $email;

    public RolesEnum $role;

    public function __construct($id, $email, $role = RolesEnum::GUEST)
    {
        $this->id = $id;
        $this->email = $email;
        $this->role = $role;
    }

    public static function fromDatabase(array $user): self
    {
        return new self(
            $user['id'],
            $user['email'],
            RolesEnum::tryFrom($user['role']) ?? RolesEnum::GUEST
        );
    }
}
