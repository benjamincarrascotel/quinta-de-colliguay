<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_with_correct_credentials()
    {
        $user = User::factory()->create();

        $response = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
            'device_name' => 'test-device',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    'access_token',
                    'token_type',
                    'expires_at',
                    'user' => [
                        'id',
                        'name',
                        'email',
                    ],
                ],
            ])
            ->assertJsonPath('data.user.email', $user->email);

        // Ensure password is not returned.
        $this->assertArrayNotHasKey('password', $response->json('data.user'));
    }

    public function test_user_cannot_login_with_incorrect_credentials()
    {
        $user = User::factory()->create();

        $response = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
            'device_name' => 'test-device',
        ]);

        // 401 Unauthorized is the correct status code for invalid credentials.
        $response->assertStatus(401);
    }

    public function test_user_can_access_protected_route_with_valid_token()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/auth/user');

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $user->id);
    }

    public function test_user_can_logout_and_token_is_revoked()
    {
        $user = User::factory()->create();

        // Create a real token to test revocation.
        // Sanctum::actingAs() uses a transient token that doesn't exist in the database.
        $token = $user->createToken('test-device')->plainTextToken;

        $this->assertDatabaseCount('personal_access_tokens', 1);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
        ])->postJson('/api/auth/logout');

        // 204 No Content is a good practice for successful logout.
        $response->assertStatus(204);

        // Assert that the token was deleted from the database.
        $this->assertDatabaseCount('personal_access_tokens', 0);

        // Verify that the token is no longer valid.
        $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
        ])->getJson('/api/auth/user')->assertStatus(401);
    }
}
