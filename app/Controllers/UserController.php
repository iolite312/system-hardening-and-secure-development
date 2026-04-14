<?php

namespace App\Controllers;

use App\Application\Session;
use App\Enums\RolesEnum;
use App\Helpers\PasswordGenerator;
use App\Repositories\UserRepository;

class UserController extends Controller
{
    private UserRepository $repo;

    public function __construct()
{
    parent::__construct();
    $this->repo = new UserRepository();
}
    public function index()
    {
        return $this->pageLoader->setLayout('main')->setPage('userAdd')->render(['page' => 'userAdd']);
    }

    public function store()
    {
        //$userRole = Session::get('user')->role;
        $email = $_POST['email'] ?? null;
        $password = $_POST['password'] ?? null;
        $result = PasswordGenerator::hashPassword($password);

        // if ($userRole == RolesEnum::SUPER_ADMIN) {
        //     $this->repo->create(
        //     $email,
        //     $result['password'],
        //     $result['salt'],
        //     RolesEnum::ADMIN->value
        // );
        // } else {
        //      $this->repo->create(
        //     $email,
        //     $result['password'],
        //     $result['salt'],
        //     RolesEnum::GUEST->value
        //     );
        // }
        $this->repo->create(
            $email,
            $result['password'],
            $result['salt'],
            RolesEnum::GUEST->value
            );
        header('Location: /adduser');
        exit;
    }

}
