<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;

// Activate Sanctum's stateful session middleware for all requests in this file.
beforeEach(function () {
    $this->withHeader('Referer', 'http://localhost:3000');
    // Stub the HaveIBeenPwned API so `uncompromised()` does not make real network calls.
    Http::fake(['https://api.pwnedpasswords.com/*' => Http::response('', 200)]);
});

// ---------------------------------------------------------------------------
// Password change
// ---------------------------------------------------------------------------

describe('password change', function () {
    it('changes the password when the current password is correct', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->withSession(['auth.password_confirmed_at' => time()])
            ->patchJson('/api/user/password', [
                'current_password' => 'password',
                'password' => 'N3wStr0ngP@ss!',
                'password_confirmation' => 'N3wStr0ngP@ss!',
            ])
            ->assertOk()
            ->assertJson(['message' => 'Password updated successfully.']);

        expect(Hash::check('N3wStr0ngP@ss!', $user->fresh()->password))->toBeTrue();
    });

    it('returns 422 when the current password is wrong', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->withSession(['auth.password_confirmed_at' => time()])
            ->patchJson('/api/user/password', [
                'current_password' => 'wrong-password',
                'password' => 'N3wStr0ngP@ss!',
                'password_confirmation' => 'N3wStr0ngP@ss!',
            ])
            ->assertUnprocessable();
    });

    it('returns 422 for a weak new password', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->withSession(['auth.password_confirmed_at' => time()])
            ->patchJson('/api/user/password', [
                'current_password' => 'password',
                'password' => 'weakpassword',       // no uppercase or numbers
                'password_confirmation' => 'weakpassword',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);
    });

    it('returns 422 when the new password confirmation does not match', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->withSession(['auth.password_confirmed_at' => time()])
            ->patchJson('/api/user/password', [
                'current_password' => 'password',
                'password' => 'N3wStr0ngP@ss!',
                'password_confirmation' => 'DifferentPass1',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);
    });

    it('returns 401 when an unauthenticated user attempts to change the password', function () {
        $this->patchJson('/api/user/password', [
            'current_password' => 'password',
            'password' => 'N3wStr0ngP@ss!',
            'password_confirmation' => 'N3wStr0ngP@ss!',
        ])->assertUnauthorized();
    });
});
