<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductionCenters\StoreProductionCenterRequest;
use App\Http\Requests\ProductionCenters\UpdateProductionCenterRequest;
use App\Http\Resources\ProductionCenterResource;
use App\Models\Company;
use App\Models\ProductionCenter;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\AllowedSort;
use Spatie\QueryBuilder\QueryBuilder;

class ProductionCenterController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $request->validate([
            'filter.company_id' => ['nullable', 'integer', Rule::exists('companies', 'id')],
        ]);

        $includeFormData = $request->boolean('with_form_data');

        $productionCenters = QueryBuilder::for(ProductionCenter::class)
            ->leftJoin('companies', 'production_centers.company_id', '=', 'companies.id')
            ->select('production_centers.*')
            ->when($request->user()->isAdmin(), function ($query) use ($request) {
                $query->where('production_centers.company_id', $request->user()->company_id);
            })
            ->allowedFilters([
                'name',
                AllowedFilter::partial('company.name', 'companies.name'),
                AllowedFilter::exact('company_id'),
            ])
            ->with('company')
            ->allowedSorts([
                'name',
                'created_at',
                AllowedSort::field('company.name', 'companies.name'),
            ])
            ->paginate(10)
            ->withQueryString();

        $filteredCompany = null;
        if ($request->user()?->isSuperAdmin() && $request->input('filter.company_id')) {
            $filteredCompany = Company::find($request->input('filter.company_id'));
        } elseif ($request->user()?->isAdmin()) {
            $filteredCompany = $request->user()->company;
        }

        return Inertia::render('production-centers/index', [
            'production_centers' => ProductionCenterResource::collection($productionCenters),
            'companies' => $includeFormData
                ? Company::assignableBy($request->user())->map->only(['id', 'name'])->values()
                : [],
            'filteredCompany' => $filteredCompany ? $filteredCompany->only('id', 'name') : null,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('production-centers/create', [
            'companies' => Company::assignableBy($request->user())->map->only(['id', 'name'])->values(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductionCenterRequest $request): RedirectResponse
    {
        ProductionCenter::create($request->validated());

        return redirect()
            ->route('production_centers.index', ['with_form_data' => true])
            ->with('success', 'Centro de producción creado con éxito.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductionCenterRequest $request, ProductionCenter $production_center): RedirectResponse
    {
        $this->authorize('update', $production_center);

        $production_center->update($request->validated());

        $redirectParams = ['with_form_data' => true];
        $filters = $request->input('filters', []);
        foreach ($filters as $key => $value) {
            $redirectParams["filter[{$key}]"] = $value;
        }

        return redirect()->route('production_centers.index', $redirectParams)->with('success', 'Centro de producción actualizado con éxito.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, ProductionCenter $production_center): RedirectResponse
    {
        $this->authorize('delete', $production_center);

        $redirectParams = ['with_form_data' => true];
        $filters = $request->input('filters', []);
        foreach ($filters as $key => $value) {
            $redirectParams["filter[{$key}]"] = $value;
        }

        if ($production_center->users()->exists()) {
            return redirect()->route('production_centers.index', $redirectParams)->with('error', 'No se puede eliminar el centro de producción porque tiene usuarios asociados.');
        }

        if ($production_center->machines()->exists()) {
            return redirect()->route('production_centers.index', $redirectParams)->with('error', 'No se puede eliminar el centro de producción porque tiene máquinas asociadas.');
        }

        $production_center->delete();

        return redirect()->route('production_centers.index', $redirectParams)->with('success', 'Centro de producción eliminado con éxito.');
    }
}
