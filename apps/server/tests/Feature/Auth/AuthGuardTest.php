<?php

declare(strict_types=1);

use App\Models\User;

// Activate Sanctum's stateful session middleware for all requests in this file.
beforeEach(function () {
    $this->withHeader('Referer', 'http://localhost:3000');
});

// ---------------------------------------------------------------------------
// Unauthenticated access
// ---------------------------------------------------------------------------

describe('unauthenticated access', function () {
    it('returns 401 on GET /api/user when not authenticated', function () {
        $this->getJson('/api/user')->assertUnauthorized();
    });

    it('returns 401 on GET /api/pets when not authenticated', function () {
        $this->getJson('/api/pets')->assertUnauthorized();
    });
});

// ---------------------------------------------------------------------------
// Authenticated access
// ---------------------------------------------------------------------------

describe('authenticated access', function () {
    it('returns 200 with user data on GET /api/user when authenticated and verified', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->getJson('/api/user')
            ->assertOk()
            ->assertJsonStructure(['id', 'name', 'email']);
    });
});

// ---------------------------------------------------------------------------
// Email-verified guard
// ---------------------------------------------------------------------------

describe('email-verified guard', function () {
    it('blocks an unverified user from accessing GET /api/pets', function () {
        $user = User::factory()->unverified()->create();

        $this->actingAs($user)
            ->getJson('/api/pets')
            ->assertForbidden();
    });

    // /api/user intentionally has NO verified check — the frontend reads
    // email_verified_at from the response and redirects unverified users to
    // /verify-email itself. Removing the guard here prevents the stuck-session
    // bug where an unverified but authenticated user can never load their state.
    it('allows an unverified user to access GET /api/user', function () {
        $user = User::factory()->unverified()->create();

        $this->actingAs($user)
            ->getJson('/api/user')
            ->assertOk()
            ->assertJsonStructure(['id', 'name', 'email', 'email_verified_at']);
    });

    it('allows a verified user to access GET /api/pets', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->getJson('/api/pets')
            ->assertOk();
    });
});
