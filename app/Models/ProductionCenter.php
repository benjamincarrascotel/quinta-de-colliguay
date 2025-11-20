<?php

namespace App\Models;

use App\Enums\RoleEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Collection;

class ProductionCenter extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['company_id', 'name'];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)->withTimestamps();
    }

    public static function assignableBy(?User $actor, ?int $companyId = null): Collection
    {
        if (! $actor) {
            return collect();
        }

        $actor->loadMissing('role', 'company');
        $actorRole = $actor->role?->name;

        if ($actorRole === RoleEnum::SUPERADMIN->value) {
            $query = static::query()->with('company')->orderBy('name');

            if ($companyId) {
                $query->where('company_id', $companyId);
            }

            return $query->get(['id', 'company_id', 'name']);
        }

        if ($actorRole === RoleEnum::ADMIN->value && $actor->company_id) {
            $query = static::query()
                ->with('company')
                ->where('company_id', $actor->company_id)
                ->orderBy('name');

            if ($companyId && $companyId !== $actor->company_id) {
                return collect();
            }

            return $query->get(['id', 'company_id', 'name']);
        }

        return collect();
    }

    public static function assignableIdsBy(?User $actor, ?int $companyId = null): array
    {
        return static::assignableBy($actor, $companyId)
            ->pluck('id')
            ->map(static fn ($id) => (int) $id)
            ->all();
    }
}
