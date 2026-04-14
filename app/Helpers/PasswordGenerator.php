<?php

namespace App\Helpers;

class PasswordGenerator
{
    public static function hashPassword($password)
    {
        $salt = StringGenerator::generateRandomString();

        $hash = password_hash(
            $password . $salt,
            PASSWORD_ARGON2ID,
            [
                'memory_cost' => 65536, // 64 MB
                'time_cost' => 4,     // iterations
                'threads' => 2,     // parallelism
            ]
        );

        return ['password' => $hash, 'salt' => $salt];
    }
}