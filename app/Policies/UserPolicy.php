<?php

namespace App\Policies;

use App\Enums\RoleEnum;
use App\Models\User;

class UserPolicy
{
    /**
     * Determine whether the authenticated user can delete the given user.
     */
    /**
     * Determine whether the authenticated user can change the password of the given user.
     */
    public function changePassword(User $actor, User $target): bool
    {
        $target->loadMissing('role');
        $actor->loadMissing('role');

        if ($actor->is($target)) {
            return false;
        }

        $actorRole = $actor->role?->name;
        $targetRole = $target->role?->name;

        if ($actorRole === RoleEnum::SUPERADMIN->value) {
            return $targetRole !== RoleEnum::SUPERADMIN->value;
        }

        if ($actorRole === RoleEnum::ADMIN->value) {
            if ($targetRole === RoleEnum::ADMIN->value || $targetRole === RoleEnum::SUPERADMIN->value) {
                return false;
            }

            return $actor->company_id === $target->company_id;
        }

        return false;
    }

    /**
     * Determine whether the authenticated user can delete the given user.
     */
    public function delete(User $actor, User $target): bool
    {
        $target->loadMissing('role');
        $actor->loadMissing('role');

        if ($actor->is($target)) {
            return false;
        }

        $actorRole = $actor->role?->name;
        $targetRole = $target->role?->name;

        if ($actorRole === RoleEnum::SUPERADMIN->value) {
            return true;
        }

        if ($actorRole === RoleEnum::ADMIN->value) {
            return in_array($targetRole, [
                RoleEnum::ADMIN->value,
                RoleEnum::NORMAL->value,
            ], true);
        }

        return false;
    }
}
