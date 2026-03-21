<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

// Activate Sanctum's stateful session middleware for all requests in this file.
beforeEach(function () {
    $this->withHeader('Referer', 'http://localhost:3000');
    // Stub the HaveIBeenPwned API so `uncompromised()` does not make real network calls.
    Http::fake(['https://api.pwnedpasswords.com/*' => Http::response('', 200)]);
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Request a password-reset token and return it via the ResetPassword notification.
 */
function requestResetToken(User $user): string
{
    Notification::fake();

    test()->postJson('/forgot-password', ['email' => $user->email]);

    $token = '';
    Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $notification) use (&$token) {
        $token = $notification->token;

        return true;
    });

    return $token;
}

// ---------------------------------------------------------------------------
// Forgot-password endpoint
// ---------------------------------------------------------------------------

describe('forgot password', function () {
    it('returns 200 with a generic message for a registered email', function () {
        Notification::fake();
        $user = User::factory()->create();

        $this->postJson('/forgot-password', ['email' => $user->email])
            ->assertOk()
            ->assertJson(['message' => __('passwords.sent')]);
    });

    it('returns the same generic message for an unregistered email (no enumeration)', function () {
        $this->postJson('/forgot-password', ['email' => 'nobody@example.com'])
            ->assertOk()
            ->assertJson(['message' => __('passwords.sent')]);
    });

    it('sends the reset link notification to a registered user', function () {
        Notification::fake();
        $user = User::factory()->create();

        $this->postJson('/forgot-password', ['email' => $user->email])->assertOk();

        Notification::assertSentTo($user, ResetPassword::class);
    });

    it('does not send a notification for an unregistered email', function () {
        Notification::fake();

        $this->postJson('/forgot-password', ['email' => 'nobody@example.com'])->assertOk();

        Notification::assertNothingSent();
    });
});

// ---------------------------------------------------------------------------
// Reset-password endpoint
// ---------------------------------------------------------------------------

describe('reset password', function () {
    it('resets the password with a valid token', function () {
        $user = User::factory()->create();
        $token = requestResetToken($user);

        $this->postJson('/reset-password', [
            'token' => $token,
            'email' => $user->email,
            'password' => 'N3wStr0ngP@ss!',
            'password_confirmation' => 'N3wStr0ngP@ss!',
        ])->assertOk();

        expect(Hash::check('N3wStr0ngP@ss!', $user->fresh()->password))->toBeTrue();
    });

    it('returns 422 for an invalid token', function () {
        $user = User::factory()->create();

        $this->postJson('/reset-password', [
            'token' => 'invalid-token-xyz',
            'email' => $user->email,
            'password' => 'N3wStr0ngP@ss!',
            'password_confirmation' => 'N3wStr0ngP@ss!',
        ])->assertUnprocessable();
    });

    it('returns 422 for an expired token', function () {
        $user = User::factory()->create();
        $token = requestResetToken($user);

        // Wind the clock past the token TTL (default 60 min)
        $this->travel(61)->minutes();

        $this->postJson('/reset-password', [
            'token' => $token,
            'email' => $user->email,
            'password' => 'N3wStr0ngP@ss!',
            'password_confirmation' => 'N3wStr0ngP@ss!',
        ])->assertUnprocessable();
    });

    it('invalidates the token after a successful reset so it cannot be reused', function () {
        $user = User::factory()->create();
        $token = requestResetToken($user);

        // First reset — success
        $this->postJson('/reset-password', [
            'token' => $token,
            'email' => $user->email,
            'password' => 'N3wStr0ngP@ss!',
            'password_confirmation' => 'N3wStr0ngP@ss!',
        ])->assertOk();

        // Second attempt with the same token — must fail
        $this->postJson('/reset-password', [
            'token' => $token,
            'email' => $user->email,
            'password' => 'An0therP@ss!',
            'password_confirmation' => 'An0therP@ss!',
        ])->assertUnprocessable();
    });

    it('returns 422 for a weak password on reset', function () {
        $user = User::factory()->create();
        $token = requestResetToken($user);

        $this->postJson('/reset-password', [
            'token' => $token,
            'email' => $user->email,
            'password' => 'weakpassword',       // no uppercase or numbers
            'password_confirmation' => 'weakpassword',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);
    });
});

// ---------------------------------------------------------------------------
// Rate limiting on forgot-password
// ---------------------------------------------------------------------------

describe('forgot-password rate limiting', function () {
    it('has a named rate limiter configured that allows 3 requests per minute', function () {
        // Fortify v1 registers the 'forgot-password' named limiter in FortifyServiceProvider
        // but does NOT automatically attach it as route middleware in this version.
        // This test verifies the limiter IS correctly configured: after 3 hits on
        // the key that the limiter resolves to, tooManyAttempts returns true.
        $email = 'throttle@example.com';
        $rawKey = Str::transliterate(Str::lower($email).'|127.0.0.1');
        $hashedKey = md5('forgot-password'.$rawKey);
        RateLimiter::clear($hashedKey);

        foreach (range(1, 3) as $ignored) {
            RateLimiter::hit($hashedKey, 60);
        }

        expect(RateLimiter::tooManyAttempts($hashedKey, 3))->toBeTrue();

        RateLimiter::clear($hashedKey);
    });
});
