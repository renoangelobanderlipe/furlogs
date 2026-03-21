<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;

// Activate Sanctum's stateful session middleware for all requests in this file.
beforeEach(function () {
    $this->withHeader('Referer', 'http://localhost:3000');
});

// ---------------------------------------------------------------------------
// Email verification link
// ---------------------------------------------------------------------------

describe('email verification link', function () {
    it('marks the email as verified and redirects to the frontend when the signed URL is valid', function () {
        $user = User::factory()->unverified()->create();

        $signedUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->email)],
        );

        $this->get($signedUrl)->assertRedirect();

        expect($user->fresh()->hasVerifiedEmail())->toBeTrue();
    });

    it('fires the Verified event on first verification', function () {
        Event::fake();

        $user = User::factory()->unverified()->create();

        $signedUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->email)],
        );

        $this->get($signedUrl);

        Event::assertDispatched(Verified::class);
    });

    it('redirects to the frontend with an error query parameter when the id is not a valid UUID', function () {
        // Simulates stale links generated before the UUID primary key migration.
        $signedUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => '1', 'hash' => sha1('any@example.com')],
        );

        $response = $this->get($signedUrl);

        $response->assertRedirect();
        expect($response->headers->get('Location'))->toContain('error=invalid_link');
    });

    it('redirects to the frontend with an error query parameter when the hash is invalid', function () {
        $user = User::factory()->unverified()->create();

        $signedUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => 'invalid-hash'],
        );

        $response = $this->get($signedUrl);

        $response->assertRedirect();
        expect($response->headers->get('Location'))->toContain('error=invalid_link');
    });

    it('does not re-fire the Verified event when an already-verified user visits the link', function () {
        Event::fake();

        // User is already verified (factory default)
        $user = User::factory()->create();

        $signedUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->email)],
        );

        $this->get($signedUrl);

        Event::assertNotDispatched(Verified::class);
    });
});

// ---------------------------------------------------------------------------
// Verified middleware on protected routes
// ---------------------------------------------------------------------------

describe('verified middleware', function () {
    it('blocks an unverified user from accessing verified-middleware-protected routes', function () {
        $user = User::factory()->unverified()->create();

        // GET /api/user is protected by both auth:sanctum and verified
        $this->actingAs($user)
            ->getJson('/api/user')
            ->assertForbidden();
    });

    it('allows a verified user to access verified-middleware-protected routes', function () {
        $user = User::factory()->create(); // email_verified_at is set by default

        $this->actingAs($user)
            ->getJson('/api/user')
            ->assertOk();
    });
});

// ---------------------------------------------------------------------------
// Resend verification email
// ---------------------------------------------------------------------------

describe('resend verification email', function () {
    it('sends a new verification notification to an unverified user', function () {
        Notification::fake();

        $user = User::factory()->unverified()->create();

        $this->actingAs($user)
            ->postJson('/api/auth/email/verification-notification')
            ->assertOk()
            ->assertJson(['message' => 'Verification link sent.']);

        Notification::assertSentTo($user, VerifyEmail::class);
    });

    it('returns "already verified" message without resending for a verified user', function () {
        Notification::fake();

        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/auth/email/verification-notification')
            ->assertOk()
            ->assertJson(['message' => 'Email already verified.']);

        Notification::assertNothingSent();
    });

    it('returns 401 when an unauthenticated user calls resend', function () {
        $this->postJson('/api/auth/email/verification-notification')
            ->assertUnauthorized();
    });

    it('throttles the resend endpoint at 7 requests per minute', function () {
        Notification::fake();

        $user = User::factory()->unverified()->create();

        // 6 allowed requests (middleware is throttle:6,1)
        foreach (range(1, 6) as $ignored) {
            $this->actingAs($user)
                ->postJson('/api/auth/email/verification-notification');
        }

        // 7th must be throttled
        $this->actingAs($user)
            ->postJson('/api/auth/email/verification-notification')
            ->assertStatus(429);
    });
});
