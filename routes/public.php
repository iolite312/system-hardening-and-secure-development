<?php

use App\Application\Router;
use App\Enums\RolesEnum;
use App\Middleware\EnsureValidLogin;
use App\Middleware\EnsureInvalidLogin;
use App\Middleware\EnsureValidRoleAccess;

$router = Router::getInstance();

$router->middleware(EnsureInvalidLogin::class, function () use ($router) {
    $router->get('/login', [App\Controllers\LoginController::class, 'index']);
    $router->post('/login', [App\Controllers\LoginController::class, 'login']);
});
$router->middleware(EnsureValidLogin::class, function () use ($router) {
    $router->get('/logout', [App\Controllers\LoginController::class, 'logout']);
    // $router->get('/', [App\Controllers\HomeController::class, 'index']);
    $router->middleware(EnsureValidRoleAccess::class, function () use ($router) {
        $router->get('/secure', [App\Controllers\HomeController::class, 'index']);
    }, [[RolesEnum::ADMIN, RolesEnum::GUEST]]);
    $router->get('/', [App\Controllers\HomeController::class, 'index']);
    $router->post('/', [App\Controllers\HomeController::class, 'index']);
});

   

 
