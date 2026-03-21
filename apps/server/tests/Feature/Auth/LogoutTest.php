<?php

declare(strict_types=1);

use App\Models\User;

// Activate Sanctum's stateful session middleware for all requests in this file.
beforeEach(function () {
    $this->withHeader('Referer', 'http://localhost:3000');
});

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------

describe('logout', function () {
    it('logs out an authenticated user and returns a success message', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/auth/logout')
            ->assertOk()
            ->assertJson(['message' => 'Logged out successfully.']);
    });

    it('returns 401 when an unauthenticated user attempts to logout', function () {
        $this->postJson('/api/auth/logout')
            ->assertUnauthorized();
    });

    it('de-authenticates the user from the web guard after logout', function () {
        $user = User::factory()->create();

        // Use actingAs so the user is authenticated in-memory.
        $this->actingAs($user);
        $this->assertAuthenticated();

        // Logout clears the web guard session.
        $this->postJson('/api/auth/logout')->assertOk();

        // After calling logout, the web guard should no longer report the user.
        $this->assertGuest('web');
    });

    it('invalidates the session so a new stateless request cannot be authenticated', function () {
        $user = User::factory()->create();

        // Log in via the real login endpoint to establish a session cookie.
        $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertOk();

        // Log out — destroys the session server-side.
        $this->postJson('/api/auth/logout')->assertOk();

        // The session was invalidated (regenerateToken was called). A subsequent
        // request from a completely fresh client (no cookies) must be unauthorized.
        $this->refreshApplication();
        $this->withHeader('Referer', 'http://localhost:3000')
            ->getJson('/api/user')
            ->assertUnauthorized();
    });
});
