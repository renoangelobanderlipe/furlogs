<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Support\Facades\RateLimiter;
use Laravel\Fortify\RecoveryCode;
use PragmaRX\Google2FA\Google2FA;

// Activate Sanctum's stateful session middleware for all requests in this file.
// Without this Referer header, /api/* routes under the `api` group don't start
// a session (Sanctum only adds session middleware for stateful-domain origins).
beforeEach(function () {
    $this->withHeader('Referer', 'http://localhost:3000');
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Generate a real TOTP secret + current valid OTP pair.
 *
 * @return array{secret: string, otp: string}
 */
function totpPair(): array
{
    $google2fa = new Google2FA;
    $secret = $google2fa->generateSecretKey();

    return ['secret' => $secret, 'otp' => $google2fa->getCurrentOtp($secret)];
}

/**
 * Create a user with 2FA fully enabled and confirmed.
 *
 * @return array{user: User, codes: string[], secret: string, otp: string}
 */
function userWithTwoFactor(): array
{
    ['secret' => $secret, 'otp' => $otp] = totpPair();

    /** @var string[] $codes */
    $codes = collect(range(1, 8))->map(fn () => RecoveryCode::generate())->all();

    $user = User::factory()->create([
        'two_factor_secret' => encrypt($secret),
        'two_factor_recovery_codes' => encrypt(json_encode($codes)),
        'two_factor_confirmed_at' => now(),
    ]);

    return compact('user', 'codes', 'secret', 'otp');
}

/**
 * Returns session data that simulates a pending 2FA login (credentials verified, challenge not yet passed).
 *
 * @return array<string, mixed>
 */
function pendingTwoFactorSession(User $user): array
{
    return ['login.id' => $user->getKey(), 'login.remember' => false];
}

// ---------------------------------------------------------------------------
// Login flow
// ---------------------------------------------------------------------------

describe('login — without 2FA', function () {
    it('completes login and returns success message', function () {
        $user = User::factory()->create();

        $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])
            ->assertOk()
            ->assertJson(['message' => 'Login successful.']);
    });

    it('returns 422 for wrong password', function () {
        $user = User::factory()->create();

        $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ])->assertUnprocessable();
    });
});

describe('login — with 2FA', function () {
    it('returns two_factor flag and does not complete the session', function () {
        ['user' => $user] = userWithTwoFactor();

        $response = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response
            ->assertOk()
            ->assertExactJson(['two_factor' => true]);

        $this->assertGuest();
    });

    it('stores login.id in the session when 2FA is pending', function () {
        ['user' => $user] = userWithTwoFactor();

        $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        expect(session('login.id'))->toBe($user->getKey());
    });
});

// ---------------------------------------------------------------------------
// Two-factor challenge — TOTP
// ---------------------------------------------------------------------------

describe('two-factor challenge — TOTP', function () {
    it('completes authentication with a valid OTP code', function () {
        ['user' => $user, 'otp' => $otp] = userWithTwoFactor();

        $this->withSession(pendingTwoFactorSession($user))
            ->postJson('/two-factor-challenge', ['code' => $otp])
            ->assertNoContent();

        $this->assertAuthenticatedAs($user);
    });

    it('rejects an invalid OTP code with 422', function () {
        ['user' => $user] = userWithTwoFactor();

        $this->withSession(pendingTwoFactorSession($user))
            ->postJson('/two-factor-challenge', ['code' => '000000'])
            ->assertUnprocessable();

        $this->assertGuest();
    });

    it('rejects an empty request body', function () {
        ['user' => $user] = userWithTwoFactor();

        $this->withSession(pendingTwoFactorSession($user))
            ->postJson('/two-factor-challenge', [])
            ->assertUnprocessable();
    });

    it('returns an error when no pending 2FA session exists', function () {
        $this->postJson('/two-factor-challenge', ['code' => '123456'])
            ->assertUnprocessable();
    });
});

// ---------------------------------------------------------------------------
// Two-factor challenge — recovery codes
// ---------------------------------------------------------------------------

describe('two-factor challenge — recovery codes', function () {
    it('completes authentication with a valid recovery code', function () {
        ['user' => $user, 'codes' => $codes] = userWithTwoFactor();

        $this->withSession(pendingTwoFactorSession($user))
            ->postJson('/two-factor-challenge', ['recovery_code' => $codes[0]])
            ->assertNoContent();

        $this->assertAuthenticatedAs($user);
    });

    it('consumes the recovery code so it cannot be reused', function () {
        ['user' => $user, 'codes' => $codes] = userWithTwoFactor();

        // First use — succeeds
        $this->withSession(pendingTwoFactorSession($user))
            ->postJson('/two-factor-challenge', ['recovery_code' => $codes[0]])
            ->assertNoContent();

        // The used code must no longer appear in the user's stored recovery codes
        $remaining = json_decode(decrypt($user->fresh()->two_factor_recovery_codes), true);
        expect($remaining)->not()->toContain($codes[0]);
    });

    it('rejects a code that was never issued', function () {
        ['user' => $user] = userWithTwoFactor();

        $this->withSession(pendingTwoFactorSession($user))
            ->postJson('/two-factor-challenge', ['recovery_code' => 'invalid-code-xxxx'])
            ->assertUnprocessable();
    });
});

// ---------------------------------------------------------------------------
// Two-factor challenge — rate limiting
// ---------------------------------------------------------------------------

describe('two-factor challenge — rate limiting', function () {
    it('throttles after 5 failed attempts per minute', function () {
        ['user' => $user] = userWithTwoFactor();

        RateLimiter::clear('two-factor:'.$user->getKey());

        $session = pendingTwoFactorSession($user);

        foreach (range(1, 5) as $ignored) {
            $this->withSession($session)
                ->postJson('/two-factor-challenge', ['code' => '000000']);
        }

        $this->withSession($session)
            ->postJson('/two-factor-challenge', ['code' => '000000'])
            ->assertStatus(429);
    });
});

// ---------------------------------------------------------------------------
// Enable 2FA
// ---------------------------------------------------------------------------

describe('enable two-factor authentication', function () {
    it('enables 2FA and sets the secret on the user', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->withSession(['auth.password_confirmed_at' => time()])
            ->postJson('/user/two-factor-authentication')
            ->assertOk();

        expect($user->fresh()->two_factor_secret)->not()->toBeNull();
    });

    it('requires password confirmation when not recently confirmed', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/user/two-factor-authentication')
            ->assertStatus(423);
    });

    it('returns the QR code SVG after enabling', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->withSession(['auth.password_confirmed_at' => time()])
            ->postJson('/user/two-factor-authentication');

        $this->actingAs($user->fresh())
            ->getJson('/user/two-factor-qr-code')
            ->assertOk()
            ->assertJsonStructure(['svg']);
    });

    it('returns the plain-text secret key after enabling', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->withSession(['auth.password_confirmed_at' => time()])
            ->postJson('/user/two-factor-authentication');

        $this->actingAs($user->fresh())
            ->getJson('/user/two-factor-secret-key')
            ->assertOk()
            ->assertJsonStructure(['secretKey']);
    });

    it('confirms 2FA setup with a valid OTP and sets two_factor_confirmed_at', function () {
        ['secret' => $secret, 'otp' => $otp] = totpPair();

        $user = User::factory()->create([
            'two_factor_secret' => encrypt($secret),
        ]);

        $this->actingAs($user)
            ->withSession(['auth.password_confirmed_at' => time()])
            ->postJson('/user/confirmed-two-factor-authentication', ['code' => $otp])
            ->assertOk();

        expect($user->fresh()->two_factor_confirmed_at)->not()->toBeNull();
    });

    it('rejects 2FA confirmation with an invalid OTP', function () {
        ['secret' => $secret] = totpPair();

        $user = User::factory()->create([
            'two_factor_secret' => encrypt($secret),
        ]);

        $this->actingAs($user)
            ->withSession(['auth.password_confirmed_at' => time()])
            ->postJson('/user/confirmed-two-factor-authentication', ['code' => '000000'])
            ->assertUnprocessable();

        expect($user->fresh()->two_factor_confirmed_at)->toBeNull();
    });
});

// ---------------------------------------------------------------------------
// Disable 2FA
// ---------------------------------------------------------------------------

describe('disable two-factor authentication', function () {
    it('disables 2FA and clears the secret', function () {
        ['user' => $user] = userWithTwoFactor();

        $this->actingAs($user)
            ->withSession(['auth.password_confirmed_at' => time()])
            ->deleteJson('/user/two-factor-authentication')
            ->assertOk();

        $user->refresh();
        expect($user->two_factor_secret)->toBeNull();
        expect($user->two_factor_confirmed_at)->toBeNull();
    });

    it('requires password confirmation when not recently confirmed', function () {
        ['user' => $user] = userWithTwoFactor();

        $this->actingAs($user)
            ->deleteJson('/user/two-factor-authentication')
            ->assertStatus(423);
    });
});

// ---------------------------------------------------------------------------
// Recovery codes
// ---------------------------------------------------------------------------

describe('recovery codes', function () {
    it('returns all 8 recovery codes for a user with 2FA enabled', function () {
        ['user' => $user] = userWithTwoFactor();

        $this->actingAs($user)
            ->withSession(['auth.password_confirmed_at' => time()])
            ->getJson('/user/two-factor-recovery-codes')
            ->assertOk()
            ->assertJsonCount(8);
    });

    it('regenerates recovery codes and invalidates old ones', function () {
        ['user' => $user, 'codes' => $oldCodes] = userWithTwoFactor();

        $this->actingAs($user)
            ->withSession(['auth.password_confirmed_at' => time()])
            ->postJson('/user/two-factor-recovery-codes')
            ->assertOk();

        $newCodes = $this->actingAs($user->fresh())
            ->withSession(['auth.password_confirmed_at' => time()])
            ->getJson('/user/two-factor-recovery-codes')
            ->json();

        expect(array_intersect($oldCodes, (array) $newCodes))->toBeEmpty();
    });

    it('requires password confirmation to regenerate recovery codes', function () {
        ['user' => $user] = userWithTwoFactor();

        $this->actingAs($user)
            ->postJson('/user/two-factor-recovery-codes')
            ->assertStatus(423);
    });
});

// ---------------------------------------------------------------------------
// Security — 2FA data must not leak through API
// ---------------------------------------------------------------------------

describe('security', function () {
    it('does not expose two_factor_secret in GET /api/user', function () {
        ['user' => $user] = userWithTwoFactor();

        $response = $this->actingAs($user)
            ->getJson('/api/user')
            ->assertOk();

        expect($response->json())->not()->toHaveKey('two_factor_secret');
    });

    it('does not expose two_factor_recovery_codes in GET /api/user', function () {
        ['user' => $user] = userWithTwoFactor();

        $response = $this->actingAs($user)
            ->getJson('/api/user')
            ->assertOk();

        expect($response->json())->not()->toHaveKey('two_factor_recovery_codes');
    });

    it('exposes two_factor_confirmed_at so the frontend can render 2FA status', function () {
        ['user' => $user] = userWithTwoFactor();

        $this->actingAs($user)
            ->getJson('/api/user')
            ->assertOk()
            ->assertJsonStructure(['two_factor_confirmed_at']);
    });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

describe('edge cases', function () {
    it('user without 2FA goes directly to dashboard after login', function () {
        $user = User::factory()->create();

        $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])
            ->assertOk()
            ->assertJsonMissing(['two_factor' => true]);

        $this->assertAuthenticatedAs($user);
    });

    it('user with 2FA secret but unconfirmed is treated as 2FA disabled', function () {
        ['secret' => $secret] = totpPair();

        $user = User::factory()->create([
            'two_factor_secret' => encrypt($secret),
            'two_factor_confirmed_at' => null,
        ]);

        $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])
            ->assertOk()
            ->assertJson(['message' => 'Login successful.'])
            ->assertJsonMissing(['two_factor' => true]);
    });

    it('password confirmation endpoint stores the confirmation timestamp', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/user/confirm-password', ['password' => 'password'])
            ->assertCreated();

        expect(session('auth.password_confirmed_at'))->not()->toBeNull();
    });

    it('confirmed-password-status returns confirmed when recently confirmed', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->withSession(['auth.password_confirmed_at' => time()])
            ->getJson('/user/confirmed-password-status')
            ->assertOk()
            ->assertJson(['confirmed' => true]);
    });
});
