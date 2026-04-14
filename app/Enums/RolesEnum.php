<?php

namespace App\Enums;

enum RolesEnum: string
{
    case SUPER_ADMIN = 'super_admin';
    case ADMIN = 'admin';
    case FRIEND = 'friend';
    case GUEST = 'guest';
}
