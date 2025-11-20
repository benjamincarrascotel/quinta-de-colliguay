<?php

namespace App\Models;

use App\Enums\RoleEnum;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Collection;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, HasUuids, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'role_id',
        'company_id',
        'name',
        'last_name',
        'email',
        'password',
        'phone',
        'phone_area_code',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::deleting(function (User $user) {
            $user->productionCenters()->detach();
        });
    }

    /**
     * Get the role that owns the user.
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function productionCenters(): BelongsToMany
    {
        return $this->belongsToMany(ProductionCenter::class)->withTimestamps();
    }

    public function isSuperAdmin(): bool
    {
        return $this->role?->name === RoleEnum::SUPERADMIN->value;
    }

    public function isAdmin(): bool
    {
        return $this->role?->name === RoleEnum::ADMIN->value;
    }

    /**
     * Get the user's full phone number.
     */
    public function getPhoneNumberAttribute(): ?string
    {
        if ($this->phone_area_code && $this->phone) {
            return $this->phone_area_code.$this->phone;
        }

        return null;
    }

    /**
     * Get the user's role for display.
     */
    public function getRoleForDisplayAttribute(): ?string
    {
        if (! $this->role) {
            return null;
        }

        return RoleEnum::from($this->role->name)->label();
    }

    /**
     * Get the user's full name.
     */
    protected function fullName(): Attribute
    {
        return Attribute::make(
            get: fn () => "{$this->name} {$this->last_name}",
        );
    }

    /**
     * Retrieve the users that the given actor is allowed to assign.
     */
    public static function assignableBy(?User $actor, ?int $companyId = null): Collection
    {
        if (! $actor) {
            return collect();
        }

        $actor->loadMissing('role', 'company');
        $actorRole = $actor->role?->name;

        if ($actorRole === RoleEnum::SUPERADMIN->value) {
            $query = static::query()->with('role')->orderBy('name');

            if ($companyId) {
                $query->where('company_id', $companyId);
            }

            return $query->get(['id', 'role_id', 'company_id', 'name', 'last_name', 'email']);
        }

        if ($actorRole === RoleEnum::ADMIN->value && $actor->company_id) {
            return static::query()
                ->with('role')
                ->where('company_id', $actor->company_id)
                ->whereHas('role', function ($query) {
                    $query->whereIn('name', [RoleEnum::NORMAL->value]);
                })
                ->orderBy('name')
                ->get(['id', 'role_id', 'company_id', 'name', 'last_name', 'email']);
        }

        return collect();
    }

    public static function assignableUsersBy(?User $actor, ?int $companyId = null): Collection
    {
        if (! $actor) {
            return collect();
        }

        $actor->loadMissing('role', 'company');
        $actorRole = $actor->role?->name;

        if ($actorRole === RoleEnum::SUPERADMIN->value) {
            $query = static::query()
                ->with('role')
                ->whereHas('role', function ($query) {
                    $query->where('name', RoleEnum::NORMAL->value);
                })
                ->orderBy('name');

            if ($companyId) {
                $query->where('company_id', $companyId);
            }

            return $query->get(['id', 'role_id', 'company_id', 'name', 'last_name', 'email']);
        }

        if ($actorRole === RoleEnum::ADMIN->value && $actor->company_id) {
            return static::query()
                ->with('role')
                ->where('company_id', $actor->company_id)
                ->whereHas('role', function ($query) {
                    $query->where('name', RoleEnum::NORMAL->value);
                })
                ->orderBy('name')
                ->get(['id', 'role_id', 'company_id', 'name', 'last_name', 'email']);
        }

        return collect();
    }
}
