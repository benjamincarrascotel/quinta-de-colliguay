<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CompanyResource;
use App\Http\Resources\ProductionCenterResource;
use App\Http\Traits\ApiResponse;
use App\Models\Company;
use App\Models\ProductionCenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MasterDataController extends Controller
{
    use ApiResponse;

    /**
     * Display master data for offline functionality.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Load user relationships
        $user->load('role', 'company');

        // Get companies based on user role
        if ($user->isSuperAdmin()) {
            $companies = Company::all();
        } else {
            // Admin/Normal: only their company
            $companies = Company::where('id', $user->company_id)->get();
        }

        // Get production centers based on user role
        if ($user->isSuperAdmin()) {
            $productionCenters = ProductionCenter::all();
        } elseif ($user->isAdmin()) {
            // Admin: all production centers of their company
            $productionCenters = ProductionCenter::where('company_id', $user->company_id)->get();
        } else {
            // Normal: only their assigned production centers
            $productionCenters = $user->productionCenters;
        }

        return $this->successResponse([
            'companies' => CompanyResource::collection($companies),
            'production_centers' => ProductionCenterResource::collection($productionCenters),
        ]);
    }
}
