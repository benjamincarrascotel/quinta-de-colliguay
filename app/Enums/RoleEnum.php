<?php

namespace App\Enums;

enum RoleEnum: string
{
    case SUPERADMIN = 'superadmin';
    case ADMIN = 'admin';
    case NORMAL = 'normal';

    public function label(): string
    {
        return match ($this) {
            self::SUPERADMIN => 'Super Administrador',
            self::ADMIN => 'Administrador',
            self::NORMAL => 'Usuario Normal',
        };
    }
}
