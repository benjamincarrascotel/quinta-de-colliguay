<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get roles
        $superadminRole = Role::where('name', 'superadmin')->firstOrFail();
        $adminRole = Role::where('name', 'admin')->firstOrFail();
        $normalRole = Role::where('name', 'normal')->firstOrFail();

        // Get companies
        $companyA = Company::where('name', 'Compañía A')->firstOrFail();
        $companyB = Company::where('name', 'Compañía B')->firstOrFail();

        // --- User Creation ---

        // Superadmin (no company)
        User::updateOrCreate(
            ['email' => 'superadmin@example.cl'],
            ['name' => 'Super', 'last_name' => 'Admin', 'password' => Hash::make('12345678'), 'role_id' => $superadminRole->id, 'company_id' => null]
        );

        // --- Company A Users ---
        User::updateOrCreate(
            ['email' => 'admin@example.cl'],
            ['name' => 'Admin A', 'last_name' => 'User', 'password' => Hash::make('12345678'), 'role_id' => $adminRole->id, 'company_id' => $companyA->id]
        );

        $marioUser = User::updateOrCreate(
            ['email' => 'maraya.solidcore@gmail.com'],
            ['name' => 'Mario', 'last_name' => 'Araya', 'password' => Hash::make('12345678'), 'role_id' => $normalRole->id, 'company_id' => $companyA->id]
        );
        $this->syncCompanyProductionCenters($marioUser, $companyA->id);

        // --- Company B Users ---
        User::updateOrCreate(
            ['email' => 'admin-b@example.cl'],
            ['name' => 'Admin B', 'last_name' => 'User', 'password' => Hash::make('12345678'), 'role_id' => $adminRole->id, 'company_id' => $companyB->id]
        );

        $normalUser = User::updateOrCreate(
            ['email' => 'normal@example.cl'],
            [
                'name' => 'Operador',
                'last_name' => 'Usuario',
                'password' => Hash::make('12345678'),
                'role_id' => $normalRole->id,
            ]
        );
        $this->syncCompanyProductionCenters($normalUser, $companyB->id);

    }

    /**
     * Syncs the user with all production centers of a given company.
     */
    private function syncCompanyProductionCenters(?User $user, int|string|null $companyId): void
    {
        if (! $user || ! $companyId) {
            return;
        }

        $company = Company::with('productionCenters')->find($companyId);

        if (! $company) {
            return;
        }

        $centerIds = $company->productionCenters->pluck('id');

        if ($centerIds->isEmpty()) {
            return;
        }

        $user->productionCenters()->sync($centerIds->all());
    }
}
