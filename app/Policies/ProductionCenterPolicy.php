<?php

namespace App\Policies;

use App\Models\ProductionCenter;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ProductionCenterPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, ProductionCenter $productionCenter): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($user->isAdmin()) {
            return $user->company_id === $productionCenter->company_id;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ProductionCenter $productionCenter): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($user->isAdmin()) {
            return $user->company_id === $productionCenter->company_id;
        }

        return false;
    }
}
