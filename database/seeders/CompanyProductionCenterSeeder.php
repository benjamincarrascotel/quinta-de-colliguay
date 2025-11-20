<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\ProductionCenter;
use Illuminate\Database\Seeder;

class CompanyProductionCenterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Company A and its production centers
        $companyA = Company::firstOrCreate(['name' => 'Compañía A']);
        ProductionCenter::firstOrCreate(['company_id' => $companyA->id, 'name' => 'Centro Norte']);
        ProductionCenter::firstOrCreate(['company_id' => $companyA->id, 'name' => 'Centro Sur']);

        // Create Company B and its production centers
        $companyB = Company::firstOrCreate(['name' => 'Compañía B']);
        ProductionCenter::firstOrCreate(['company_id' => $companyB->id, 'name' => 'Centro Este']);
        ProductionCenter::firstOrCreate(['company_id' => $companyB->id, 'name' => 'Centro Oeste']);
    }
}
