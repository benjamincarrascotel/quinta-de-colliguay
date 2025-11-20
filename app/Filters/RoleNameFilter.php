<?php

namespace App\Filters;

use App\Enums\RoleEnum;
use Illuminate\Database\Eloquent\Builder;
use Spatie\QueryBuilder\Filters\Filter;

class RoleNameFilter implements Filter
{
    public function __invoke(Builder $query, $value, string $property): void
    {
        $matchingRoles = collect(RoleEnum::cases())
            ->filter(fn (RoleEnum $role) => str_contains(strtolower($role->label()), strtolower($value)))
            ->map(fn (RoleEnum $role) => $role->value)
            ->values()
            ->all();

        if (count($matchingRoles) > 0) {
            $query->whereIn('roles.name', $matchingRoles);
        } else {
            // If no roles match the search, return no results.
            $query->whereRaw('false');
        }
    }
}
