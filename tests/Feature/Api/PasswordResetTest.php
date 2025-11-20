<?php

namespace Tests\Feature\Api;

use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_forgot_password_sends_reset_link()
    {
        Notification::fake();

        $user = User::factory()->create();

        $this->postJson('/api/auth/forgot-password', ['email' => $user->email])
            ->assertOk()
            ->assertJson(['message' => 'Te hemos enviado por correo electrónico el enlace para restablecer tu contraseña.']);

        Notification::assertSentTo($user, ResetPasswordNotification::class);
    }

    public function test_user_can_reset_password_with_valid_token()
    {
        Notification::fake();

        $user = User::factory()->create();

        /** @var \Illuminate\Auth\Passwords\PasswordBroker $passwordBroker */
        $passwordBroker = Password::broker();
        $token = $passwordBroker->createToken($user);

        $response = $this->postJson('/api/auth/reset-password', [
            'email' => $user->email,
            'token' => $token,
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

        $response->assertOk()
            ->assertJson(['message' => 'Tu contraseña ha sido restablecida.']);
    }
}
