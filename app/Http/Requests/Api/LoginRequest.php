<?php

namespace App\Http\Requests\Api;

use App\Models\User;
use App\Rules\ValidEmail;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Hash;

class LoginRequest extends FormRequest
{
    /**
     * The user attempting the login.
     *
     * @var \App\Models\User|null
     */
    protected $user;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => [
                'required',
                new ValidEmail,
            ],
            'password' => 'required|string|min:8',
            'device_name' => 'required|string|max:255',
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     *
     * @throws \Illuminate\Auth\AuthenticationException
     */
    public function authenticate(): User
    {
        if ($this->user) {
            return $this->user;
        }

        $user = User::with('company')->where('email', $this->email)->first();

        if (! $user || ! Hash::check($this->password, $user->password)) {
            throw new AuthenticationException;
        }

        // Check if user's company is active
        if ($user->company_id && ! $user->company?->is_active) {
            throw new AuthenticationException;
        }

        return $this->user = $user;
    }
}
