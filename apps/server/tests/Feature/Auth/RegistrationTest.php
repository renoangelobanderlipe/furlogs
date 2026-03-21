<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;

// Activate Sanctum's stateful session middleware for all requests in this file.
beforeEach(function () {
    $this->withHeader('Referer', 'http://localhost:3000');
    // Stub the HaveIBeenPwned API so `uncompromised()` does not make real network calls.
    Http::fake(['https://api.pwnedpasswords.com/*' => Http::response('', 200)]);
});

// ---------------------------------------------------------------------------
// Valid registration
// ---------------------------------------------------------------------------

describe('successful registration', function () {
    it('creates the user, logs them in, and returns 201', function () {
        Event::fake();

        $this->postJson('/api/auth/register', [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'password' => 'Password1',
            'password_confirmation' => 'Password1',
        ])
            ->assertCreated()
            ->assertJson(['message' => 'Registration successful. Please verify your email.']);

        $this->assertDatabaseHas('users', ['email' => 'jane@example.com']);
        $this->assertAuthenticated();
    });

    it('fires the Registered event on success', function () {
        Event::fake();

        $this->postJson('/api/auth/register', [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'password' => 'Password1',
            'password_confirmation' => 'Password1',
        ])->assertCreated();

        Event::assertDispatched(Registered::class, function (Registered $event) {
            return $event->user->email === 'jane@example.com';
        });
    });

    it('sends the email verification notification on success', function () {
        Notification::fake();
        // Fake all events EXCEPT Registered so the MustVerifyEmail listener still fires.
        Event::fake()->except([Registered::class]);

        $this->postJson('/api/auth/register', [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'password' => 'Password1',
            'password_confirmation' => 'Password1',
        ])->assertCreated();

        $user = User::where('email', 'jane@example.com')->firstOrFail();
        Notification::assertSentTo($user, VerifyEmail::class);
    });
});

// ---------------------------------------------------------------------------
// Mail failure atomicity
// ---------------------------------------------------------------------------

describe('registration atomicity', function () {
    it('does not persist the user when email sending throws', function () {
        // Simulate an SMTP failure by making the Registered listener throw.
        Event::listen(Registered::class, function (): never {
            throw new RuntimeException('SMTP connection failed');
        });

        $this->postJson('/api/auth/register', [
            'name' => 'Jane Doe',
            'email' => 'mail-fail@example.com',
            'password' => 'Password1',
            'password_confirmation' => 'Password1',
        ])->assertStatus(500);

        $this->assertDatabaseMissing('users', ['email' => 'mail-fail@example.com']);
    });
});

// ---------------------------------------------------------------------------
// Validation failures
// ---------------------------------------------------------------------------

describe('registration validation', function () {
    it('returns 422 for a duplicate email', function () {
        User::factory()->create(['email' => 'taken@example.com']);

        $this->postJson('/api/auth/register', [
            'name' => 'Another User',
            'email' => 'taken@example.com',
            'password' => 'Password1',
            'password_confirmation' => 'Password1',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    });

    it('returns 422 for a password without uppercase letters', function () {
        $this->postJson('/api/auth/register', [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'password' => 'password1',
            'password_confirmation' => 'password1',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);
    });

    it('returns 422 for a password confirmation mismatch', function () {
        $this->postJson('/api/auth/register', [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'password' => 'Password1',
            'password_confirmation' => 'DifferentPass1',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);
    });

    it('returns 422 when required fields are missing', function (string $field) {
        $payload = [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'password' => 'Password1',
            'password_confirmation' => 'Password1',
        ];
        unset($payload[$field]);

        $this->postJson('/api/auth/register', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors([$field]);
    })->with(['name', 'email', 'password']);
});

// ---------------------------------------------------------------------------
// Guest-only middleware
// ---------------------------------------------------------------------------

describe('guest middleware', function () {
    it('blocks an already-authenticated user from registering again', function () {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/auth/register', [
            'name' => 'Jane Doe',
            'email' => 'jane2@example.com',
            'password' => 'Password1',
            'password_confirmation' => 'Password1',
        ]);

        // Guest middleware redirects (302) — not 201.
        expect($response->status())->not()->toBe(201);
    });
});

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------

describe('registration rate limiting', function () {
    it('returns 429 on the 6th request within one minute', function () {
        // The register route uses throttle:5,1 (unnamed limiter).
        // ThrottleRequests resolves the key as sha1(domain|ip) for guest requests.
        // With CACHE_STORE=array each postJson() gets a fresh in-memory store,
        // so we pre-seed 5 hits directly to simulate 5 prior attempts.
        $throttleKey = sha1('|127.0.0.1');
        RateLimiter::clear($throttleKey);

        foreach (range(1, 5) as $ignored) {
            RateLimiter::hit($throttleKey, 60);
        }

        // 6th request — throttle middleware rejects before validation runs
        $this->postJson('/api/auth/register', [
            'name' => 'Jane Doe',
            'email' => 'throttle@example.com',
            'password' => 'Password1',
            'password_confirmation' => 'Password1',
        ])->assertStatus(429);

        RateLimiter::clear($throttleKey);
    });
});
