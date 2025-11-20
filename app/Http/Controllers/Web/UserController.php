<?php

namespace App\Http\Controllers\Web;

use App\Enums\RoleEnum;
use App\Filters\PhoneNumberFilter;
use App\Filters\RoleNameFilter;
use App\Http\Controllers\Controller;
use App\Http\Requests\Users\DestroyUserRequest;
use App\Http\Requests\Users\StoreUserRequest;
use App\Http\Requests\Users\UpdateUserPasswordRequest;
use App\Http\Requests\Users\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\Company;
use App\Models\ProductionCenter;
use App\Models\Role;
use App\Models\User;
use App\Sorters\PhoneNumberSort;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\AllowedSort;
use Spatie\QueryBuilder\QueryBuilder;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $request->validate([
            'filter.company_id' => ['nullable', 'integer', Rule::exists('companies', 'id')],
            'filter.production_center_id' => ['nullable', 'integer', Rule::exists('production_centers', 'id')],
        ]);

        $includeFormData = $request->boolean('with_form_data');

        $users = QueryBuilder::for(User::class)
            ->leftJoin('roles', 'users.role_id', '=', 'roles.id')
            ->leftJoin('companies', 'users.company_id', '=', 'companies.id')
            ->select('users.*')
            ->with(['role', 'company', 'productionCenters'])
            ->allowedFilters([
                'name',
                'email',
                AllowedFilter::custom('role', new RoleNameFilter),
                AllowedFilter::partial('company.name', 'companies.name'),
                AllowedFilter::custom('phone_number', new PhoneNumberFilter),
                AllowedFilter::exact('company_id'),
                AllowedFilter::callback('production_center_id', function ($query, $value) {
                    $query->whereHas('productionCenters', function ($q) use ($value) {
                        $q->where('production_centers.id', $value);
                    });
                }),
            ])
            ->allowedSorts([
                'name',
                'email',
                AllowedSort::field('role', 'roles.name'),
                AllowedSort::field('company.name', 'companies.name'),
                AllowedSort::custom('phone_number', new PhoneNumberSort),
            ])
            ->when($request->user(), fn ($query) => $query->where('users.id', '!=', $request->user()->id))
            ->when($request->user()?->isAdmin(), function ($query) use ($request) {
                $query->where('users.company_id', $request->user()->company_id);
            })
            ->paginate(10)
            ->withQueryString();

        $filteredCompany = null;
        if ($request->user()?->isSuperAdmin() && $request->input('filter.company_id')) {
            $filteredCompany = Company::find($request->input('filter.company_id'));
        } elseif ($request->user()?->isAdmin()) {
            $filteredCompany = $request->user()->company;
        }

        return Inertia::render('users/index', [
            'users' => UserResource::collection($users),
            'roles' => $includeFormData
                ? Role::assignableBy($request->user())->map->only(['id', 'name', 'label'])->values()
                : [],
            'companies' => $includeFormData
                ? Company::assignableBy($request->user())->map->only(['id', 'name'])->values()
                : [],
            'productionCenters' => $includeFormData
                ? ProductionCenter::assignableBy($request->user())
                    ->map(function (ProductionCenter $center) {
                        return [
                            'id' => $center->id,
                            'name' => $center->name,
                            'company_id' => $center->company_id,
                        ];
                    })
                    ->groupBy('company_id')
                    ->map(fn ($group) => $group->values())
                    ->all()
                : [],
            'filteredCompany' => $filteredCompany ? $filteredCompany->only('id', 'name') : null,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('users/create', [
            'roles' => Role::assignableBy($request->user())->map->only(['id', 'name', 'label'])->values(),
            'companies' => Company::assignableBy($request->user())->map->only(['id', 'name'])->values(),
            'productionCenters' => ProductionCenter::assignableBy($request->user())
                ->map(function (ProductionCenter $center) {
                    return [
                        'id' => $center->id,
                        'name' => $center->name,
                        'company_id' => $center->company_id,
                    ];
                })
                ->groupBy('company_id')
                ->map(fn ($group) => $group->values())
                ->all(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        $user = User::create($request->validated());

        $user->load('role');
        $this->syncProductionCenters($user, $request->input('production_center_ids', []));

        return redirect()->route('users.index', ['with_form_data' => true])->with('success', 'Usuario creado con éxito.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $this->abortIfForbidden($user, $request->user());

        $user->update($request->validated());

        $user->load('role');
        $this->syncProductionCenters($user, $request->input('production_center_ids', []));

        $redirectParams = ['with_form_data' => true];
        $filters = $request->input('filters', []);
        foreach ($filters as $key => $value) {
            $redirectParams["filter[{$key}]"] = $value;
        }

        return redirect()->route('users.index', $redirectParams)->with('success', 'Usuario actualizado con éxito.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(DestroyUserRequest $request, User $user): RedirectResponse
    {
        $this->abortIfForbidden($user, $request->user());

        $user->delete();

        $redirectParams = ['with_form_data' => true];
        $filters = $request->input('filters', []);
        foreach ($filters as $key => $value) {
            $redirectParams["filter[{$key}]"] = $value;
        }

        return redirect()->route('users.index', $redirectParams)->with('success', 'Usuario eliminado con éxito.');
    }

    public function changePasswordForm(Request $request): Response
    {
        $companies = Company::assignableBy($request->user())->map->only(['id', 'name'])->values();
        $users = User::query()
            ->where('id', '!=', $request->user()->id)
            ->when($request->user()->isAdmin(), function ($query) use ($request) {
                $query->where('company_id', $request->user()->company_id)
                    ->whereHas('role', function ($query) {
                        $query->where('name', '!=', RoleEnum::ADMIN->value);
                    });
            })
            ->when($request->user()->isSuperAdmin(), function ($query) {
                $query->whereHas('role', function ($query) {
                    $query->where('name', '!=', RoleEnum::SUPERADMIN->value);
                });
            })
            ->get(['id', 'name', 'last_name', 'company_id', 'email']);

        return Inertia::render('users/change-password', [
            'companies' => $companies,
            'users' => $users,
        ]);
    }

    public function updatePassword(UpdateUserPasswordRequest $request, User $user): RedirectResponse
    {
        $user->update([
            'password' => Hash::make($request->input('password')),
        ]);

        return redirect()->route('users.index')->with('success', 'Contraseña actualizada con éxito.');
    }

    /**
     * Avoid editing or deleting forbidden user combinations from this controller.
     */
    protected function abortIfForbidden(User $user, ?User $actor): void
    {
        $user->loadMissing('role');

        if ($user->role?->name === RoleEnum::SUPERADMIN->value) {
            abort(403, 'Los superadministradores solo se gestionan desde el perfil del propio usuario.');
        }

        if (! $actor) {
            return;
        }

        $actor->loadMissing('role');

        if (
            $actor->role?->name === RoleEnum::ADMIN->value &&
            $user->role?->name === RoleEnum::ADMIN->value
        ) {
            abort(403, 'Los administradores no pueden gestionar administradores desde esta vista.');
        }
    }

    /**
     * Sync tha production_center_user table
     */
    protected function syncProductionCenters(User $user, array $productionCenterIds): void
    {
        $roleName = $user->role?->name;

        $shouldHaveProductionCenters = in_array($roleName, [
            RoleEnum::NORMAL->value,
        ], true);

        if (! $shouldHaveProductionCenters) {
            // When user no longer requires production centers, remove ALL machine assignments
            $user->machines()->detach();
            $user->productionCenters()->sync([]);

            return;
        }

        // Get current production center IDs before sync
        $currentProductionCenterIds = $user->productionCenters()->pluck('production_centers.id')->toArray();

        $ids = collect($productionCenterIds)
            ->filter(static fn ($value) => $value !== null && $value !== '')
            ->map(static fn ($value) => (int) $value)
            ->unique()
            ->values()
            ->all();

        // Sync production centers
        $user->productionCenters()->sync($ids);
    }
}
