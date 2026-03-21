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

    it('blocks an unverified user from accessing GET /api/user', function () {
        $user = User::factory()->unverified()->create();

        $this->actingAs($user)
            ->getJson('/api/user')
            ->assertForbidden();
    });

    it('allows a verified user to access GET /api/pets', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->getJson('/api/pets')
            ->assertOk();
    });
});
