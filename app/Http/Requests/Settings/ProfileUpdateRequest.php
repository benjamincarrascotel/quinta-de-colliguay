<?php

namespace App\Http\Requests\Settings;

use App\Models\User;
use App\Rules\ValidEmail;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],

            'last_name' => ['required', 'string', 'max:255'],

            'email' => [
                'required',
                new ValidEmail,
                Rule::unique(User::class)->ignore($this->user()->id),
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
            'last_name' => $this->filled('last_name') ? $this->input('last_name') : null,
            'phone_area_code' => $this->filled('phone_area_code') ? $this->input('phone_area_code') : null,
            'phone' => $this->filled('phone') ? $this->input('phone') : null,
            'email' => $this->filled('email') ? Str::lower($this->input('email')) : null,
        ]);
    }
}
