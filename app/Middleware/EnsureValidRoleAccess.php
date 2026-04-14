<?php

namespace App\Middleware;

use App\Application\Request;
use App\Application\Session;
use App\Repositories\LoginRepository;

class EnsureValidRoleAccess implements MiddlewareInterface
{
    private array $allowedRoles;
    private LoginRepository $loginRepository;

    public function __construct(array $allowedRoles = [])
    {
        $this->allowedRoles = $allowedRoles;
        $this->loginRepository = new LoginRepository();
    }

    public function handle(): bool
    {
        $userRole = Session::get('user')->role;

        if (empty($this->allowedRoles)) {
            return true;
        }

        return !in_array($userRole, $this->allowedRoles, true);
    }
}
