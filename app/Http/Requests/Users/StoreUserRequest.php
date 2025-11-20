<?php

namespace App\Http\Requests\Users;

use App\Enums\RoleEnum;
use App\Models\Company;
use App\Models\ProductionCenter;
use App\Models\Role;
use App\Rules\ValidEmail;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        /** @var User $user */
        $user = $this->user();

        return $user->isSuperAdmin() || $user->isAdmin();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        $actor = $this->user();
        $assignableRoleIds = Role::assignableIdsBy($actor);

        if ($assignableRoleIds === []) {
            abort(403, 'No estás autorizado para asignar roles.');
        }

        $roleId = (int) $this->input('role_id');
        $role = Role::query()->find($roleId);
        $roleName = $role?->name;

        $assignableCompanyIds = Company::assignableIdsBy($actor);
        $companyRules = ['nullable', 'integer', Rule::exists('companies', 'id')];

        $requiresCompany = in_array($roleName, [
            RoleEnum::ADMIN->value,
            RoleEnum::NORMAL->value,
        ], true);

        if ($requiresCompany) {
            if ($assignableCompanyIds === []) {
                abort(403, 'No estás autorizado para asignar compañías.');
            }

            $companyRules[] = Rule::in($assignableCompanyIds);
            $companyRules[] = 'required';
        } else {
            $companyRules[] = Rule::in($assignableCompanyIds);
        }

        $companyId = $this->filled('company_id') ? (int) $this->input('company_id') : null;
        $company = $companyId ? Company::find($companyId) : null;
        $assignableProductionCenterIds = ProductionCenter::assignableIdsBy($actor, $companyId);
        $requiresProductionCenters = in_array($roleName, [
            RoleEnum::NORMAL->value,
        ], true);

        $productionCentersRules = ['nullable', 'array'];

        if ($requiresProductionCenters) {
            if ($companyId === null) {
                abort(422, 'Debes seleccionar una compañía antes de asignar centros de producción.');
            }

            // Only require production centers if the selected company has them
            if ($company && $company->productionCenters()->exists()) {
                if ($assignableProductionCenterIds === []) {
                    abort(403, 'No estás autorizado para asignar centros de producción.');
                }
                $productionCentersRules[] = 'required';
                $productionCentersRules[] = 'min:1';
            } elseif ($this->filled('production_center_ids')) {
                // If the user tries to send centers for a company that has none, return an error.
                return [
                    'production_center_ids' => [function ($attribute, $value, $fail) {
                        $fail('La compañía seleccionada no tiene centros de producción para asignar.');
                    }],
                ];
            }
        }

        return [
            'name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', new ValidEmail, 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'role_id' => ['required', 'integer', Rule::exists('roles', 'id'), Rule::in($assignableRoleIds)],
            'company_id' => $companyRules,
            'production_center_ids' => $productionCentersRules,
            'production_center_ids.*' => [
                'integer',
                Rule::exists('production_centers', 'id'),
                Rule::in($assignableProductionCenterIds),
            ],
            'phone' => ['nullable', 'string', 'required_with:phone_area_code', 'regex:/^\d{8,9}$/'],
            'phone_area_code' => ['nullable', 'string', 'required_with:phone', 'regex:/^\+\d{1,3}$/'],
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'email' => $this->filled('email') ? Str::lower($this->input('email')) : null,
            'role_id' => $this->filled('role_id') ? (int) $this->input('role_id') : null,
            'company_id' => $this->filled('company_id') ? (int) $this->input('company_id') : null,
            'production_center_ids' => $this->prepareProductionCenters(),
        ]);
    }

    /**
     * Normalize production center IDs.
     */
    protected function prepareProductionCenters(): array
    {
        $centers = $this->input('production_center_ids', []);

        if (! is_array($centers)) {
            return [];
        }

        return collect($centers)
            ->filter(static fn ($value) => $value !== null && $value !== '')
            ->map(static fn ($value) => (int) $value)
            ->unique()
            ->values()
            ->all();
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'El nombre es obligatorio.',
            'last_name.required' => 'El apellido es obligatorio.',
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.unique' => 'Este correo electrónico ya está en uso.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.confirmed' => 'La confirmación de la contraseña no coincide.',
            'role_id.required' => 'Debes seleccionar un rol.',
            'role_id.in' => 'No tienes permiso para asignar este rol.',
            'company_id.required' => 'Debes seleccionar una compañía para este rol.',
            'company_id.in' => 'No tienes permiso para asignar esta compañía.',
            'production_center_ids.required' => 'Debes seleccionar al menos un centro de producción.',
            'production_center_ids.min' => 'Debes seleccionar al menos un centro de producción.',
            'production_center_ids.*.in' => 'Uno de los centros de producción seleccionados no es válido.',
            'phone.required_with' => 'El teléfono es obligatorio si indicas un código de área.',
            'phone.regex' => 'El formato del teléfono no es válido (debe tener 8 o 9 dígitos).',
            'phone_area_code.required_with' => 'El código de área es obligatorio si indicas un teléfono.',
            'phone_area_code.regex' => 'El formato del código de área no es válido (ej: +56).',
        ];
    }
}
