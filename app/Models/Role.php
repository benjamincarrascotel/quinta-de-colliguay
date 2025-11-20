<?php

namespace App\Models;

use App\Enums\RoleEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Collection;

class Role extends Model
{
    use SoftDeletes;

    /**
     * Append commonly used attributes when serializing the model.
     *
     * @var list<string>
     */
    protected $appends = ['label'];

    /**
     * Get the users for the role.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Human readable label for the role.
     */
    public function getLabelAttribute(): string
    {
        return RoleEnum::from($this->name)->label();
    }

    /**
     * Retrieve the roles that the given actor is allowed to assign.
     */
    public static function assignableBy(?User $actor): Collection
    {
        if (! $actor) {
            return collect();
        }

        $actor->loadMissing('role');
        $allowedNames = static::assignableRoleNamesFor($actor->role?->name);

        if ($allowedNames === []) {
            return collect();
        }

        return static::query()
            ->select(['id', 'name'])
            ->whereIn('name', $allowedNames)
            ->orderBy('id')
            ->get();
    }

    /**
     * Return the role identifiers allowed for the actor.
     */
    public static function assignableIdsBy(?User $actor): array
    {
        return static::assignableBy($actor)
            ->pluck('id')
            ->map(static fn ($id) => (int) $id)
            ->all();
    }

    /**
     * Map the actor role to the roles they can assign.
     */
    protected static function assignableRoleNamesFor(?string $actorRole): array
    {
        return match ($actorRole) {
            RoleEnum::SUPERADMIN->value => [
                RoleEnum::ADMIN->value,
                RoleEnum::NORMAL->value,
            ],
            RoleEnum::ADMIN->value => [
                RoleEnum::NORMAL->value,
            ],
            default => [],
        };
    }
}
