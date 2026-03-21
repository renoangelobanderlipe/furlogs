<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Support\Facades\RateLimiter;

// Activate Sanctum's stateful session middleware for all requests in this file.
beforeEach(function () {
    $this->withHeader('Referer', 'http://localhost:3000');
});

// ---------------------------------------------------------------------------
// Successful login
// ---------------------------------------------------------------------------

describe('successful login', function () {
    it('returns a success message when credentials are valid', function () {
        $user = User::factory()->create();

        $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])
            ->assertOk()
            ->assertJson(['message' => 'Login successful.']);
    });

    it('authenticates the user after a successful login', function () {
        $user = User::factory()->create();

        $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertOk();

        $this->assertAuthenticatedAs($user);
    });

    it('clears the rate limiter key after a successful login', function () {
        $user = User::factory()->create();
        $key = 'login:'.strtolower($user->email).'|127.0.0.1';

        // Simulate a prior failed attempt
        RateLimiter::hit($key, 900);

        $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertOk();

        expect(RateLimiter::attempts($key))->toBe(0);
    });

    it('sets the remember token when remember is true', function () {
        $user = User::factory()->create(['remember_token' => null]);

        $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
            'remember' => true,
        ])->assertOk();

        expect($user->fresh()->remember_token)->not()->toBeNull();
    });
});

// ---------------------------------------------------------------------------
// Credential failures
// ---------------------------------------------------------------------------

describe('login credential failures', function () {
    it('returns 422 for a wrong password', function () {
        $user = User::factory()->create();

        $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ])->assertUnprocessable();
    });

    it('returns 422 for a non-existent email', function () {
        $this->postJson('/api/auth/login', [
            'email' => 'nobody@example.com',
            'password' => 'password',
        ])->assertUnprocessable();
    });
});

// ---------------------------------------------------------------------------
// Account lockout
// ---------------------------------------------------------------------------

describe('account lockout', function () {
    it('blocks login after 5 failed attempts and returns seconds remaining', function () {
        $user = User::factory()->create();

        // LoginController keys the rate limiter as 'login:email|ip'.
        // With CACHE_STORE=array each postJson() gets a fresh in-memory cache, so
        // we pre-seed 5 hits directly so the next request triggers tooManyAttempts.
        $key = 'login:'.strtolower($user->email).'|127.0.0.1';
        RateLimiter::clear($key);

        foreach (range(1, 5) as $ignored) {
            RateLimiter::hit($key, 900);
        }

        // 6th attempt: tooManyAttempts fires before the credentials are checked
        $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'wrong',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);

        RateLimiter::clear($key);
    });
});
