<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\Companies\StoreCompanyRequest;
use App\Http\Requests\Companies\UpdateCompanyRequest;
use App\Http\Resources\CompanyResource;
use App\Models\Company;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class CompanyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $request->validate([
            'filter.is_active' => ['nullable', 'boolean'],
        ]);

        $includeFormData = $request->boolean('with_form_data');

        // Apply a default filter if none is provided
        $isActiveFilter = $request->input('filter.is_active');
        if ($isActiveFilter === null) {
            $request->merge(['filter' => array_merge($request->input('filter', []), ['is_active' => true])]);
            $isActiveFilter = true;
        } else {
            $isActiveFilter = (bool) $isActiveFilter;
        }

        $companies = QueryBuilder::for(Company::class)
            ->allowedFilters([
                'name',
                AllowedFilter::exact('is_active'),
            ])
            ->allowedSorts(['name', 'created_at'])
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('companies/index', [
            'companies' => CompanyResource::collection($companies),
            'isActiveFilter' => $isActiveFilter,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('companies/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCompanyRequest $request): RedirectResponse
    {
        Company::create($request->validated());

        return redirect()->route('companies.index')->with('success', 'Compañía creada con éxito.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCompanyRequest $request, Company $company): RedirectResponse
    {
        $wasActive = $company->is_active;

        $company->update($request->validated());

        // If the company was deactivated, log out all its users
        if ($wasActive && ! $company->is_active) {
            $this->logoutCompanyUsers($company);
        }

        $redirectParams = ['with_form_data' => true];
        $filters = $request->input('filters', []);
        foreach ($filters as $key => $value) {
            $redirectParams["filter[{$key}]"] = $value;
        }

        return redirect()->route('companies.index', $redirectParams)->with('success', 'Compañía actualizada con éxito.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Company $company): RedirectResponse
    {
        $redirectParams = ['with_form_data' => true];
        $filters = $request->input('filters', []);
        foreach ($filters as $key => $value) {
            $redirectParams["filter[{$key}]"] = $value;
        }

        if ($company->productionCenters()->exists()) {
            return redirect()->route('companies.index', $redirectParams)->with('error', 'No se puede eliminar la compañía porque tiene centros de producción asociados.');
        }

        if ($company->users()->exists()) {
            return redirect()->route('companies.index', $redirectParams)->with('error', 'No se puede eliminar la compañía porque tiene usuarios asociados.');
        }

        $company->delete();

        return redirect()->route('companies.index', $redirectParams)->with('success', 'Compañía eliminada con éxito.');
    }

    /**
     * Logout all users from a company by invalidating their sessions and revoking API tokens.
     */
    private function logoutCompanyUsers(Company $company): void
    {
        $company->loadMissing('users');

        if ($company->users->isEmpty()) {
            return;
        }

        // Invalidate web sessions
        DB::table(config('session.table', 'sessions'))
            ->whereIn('user_id', $company->users->pluck('id'))
            ->delete();

        // Revoke API tokens (same as AuthController::logout)
        foreach ($company->users as $user) {
            $user->tokens()->delete();
        }
    }
}
