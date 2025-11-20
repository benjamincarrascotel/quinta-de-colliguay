<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ForgotPasswordRequest;
use App\Http\Requests\Api\LoginRequest;
use App\Http\Requests\Api\ResetPasswordRequest;
use App\Http\Resources\UserResource;
use App\Http\Traits\ApiResponse;
use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;

class AuthController extends Controller
{
    use ApiResponse;

    public function login(LoginRequest $request): JsonResponse
    {
        $user = $request->authenticate();

        $user->load('company', 'productionCenters');

        $token = $user->createToken($request->device_name, ['*'], now()->addDays(60));

        return $this->successResponse([
            'access_token' => $token->plainTextToken,
            'token_type' => 'Bearer',
            'expires_at' => $token->accessToken->expires_at,
            'user' => new UserResource($user),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->successResponse(null, 204);
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (! $user) {
            return $this->successResponse(['message' => 'Te hemos enviado por correo electrónico el enlace para restablecer tu contraseña.']);
        }

        /** @var \Illuminate\Auth\Passwords\PasswordBroker $passwordBroker */
        $passwordBroker = Password::broker();
        $token = $passwordBroker->createToken($user);
        $user->notify(new ResetPasswordNotification($token));

        return $this->successResponse(['message' => 'Te hemos enviado por correo electrónico el enlace para restablecer tu contraseña.']);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        /** @var \Illuminate\Auth\Passwords\PasswordBroker $passwordBroker */
        $passwordBroker = Password::broker();
        $response = $passwordBroker->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => bcrypt($password),
                ])->save();
            }
        );

        if ($response == Password::PASSWORD_RESET) {
            return $this->successResponse(['message' => 'Tu contraseña ha sido restablecida.']);
        }

        return $this->failResponse('No se pudo restablecer la contraseña.', [], 400);
    }
}
