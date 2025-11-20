<?php

namespace App\Models;

use App\Enums\RoleEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Collection;

class Company extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['name', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function productionCenters(): HasMany
    {
        return $this->hasMany(ProductionCenter::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public static function assignableBy(?User $actor): Collection
    {
        if (! $actor) {
            return collect();
        }

        $actor->loadMissing('role', 'company');
        $actorRole = $actor->role?->name;

        if ($actorRole === RoleEnum::SUPERADMIN->value) {
            return static::query()->orderBy('name')->get(['id', 'name']);
        }

        if ($actorRole === RoleEnum::ADMIN->value && $actor->company_id) {
            return static::query()->whereKey($actor->company_id)->get(['id', 'name']);
        }

        return collect();
    }

    public static function assignableIdsBy(?User $actor): array
    {
        return static::assignableBy($actor)->pluck('id')->map(static fn ($id) => (int) $id)->all();
    }
}
