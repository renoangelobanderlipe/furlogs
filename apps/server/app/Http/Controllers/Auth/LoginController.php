<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    public function __invoke(LoginRequest $request): JsonResponse
    {
        $key = 'login:'.$request->string('email').'|'.$request->ip();

        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);

            throw ValidationException::withMessages([
                'email' => ["Too many login attempts. Please try again in {$seconds} seconds."],
            ]);
        }

        // Secondary rate limit keyed on email only — prevents brute-forcing across rotated IPs.
        // trustProxies(at: '*') makes IP spoofing trivial, so this limit cannot be bypassed by
        // changing IPs. Must remain independent of the IP-based limiter above.
        $emailKey = 'login-email:'.Str::lower((string) $request->string('email'));

        if (RateLimiter::tooManyAttempts($emailKey, 10)) {
            $availableIn = RateLimiter::availableIn($emailKey);

            throw ValidationException::withMessages([
                'email' => [trans('auth.throttle', [
                    'seconds' => $availableIn,
                    'minutes' => (int) ceil($availableIn / 60),
                ])],
            ]);
        }

        $remember = (bool) $request->boolean('remember');
        $credentials = $request->only('email', 'password');

        if (! Auth::attempt($credentials, $remember)) {
            RateLimiter::hit($key, 900); // 15 min lockout window
            RateLimiter::hit($emailKey, 900); // 15 min window (email-only limiter)

            throw ValidationException::withMessages([
                'email' => ['These credentials do not match our records.'],
            ]);
        }

        RateLimiter::clear($key);
        RateLimiter::clear($emailKey);

        /** @var User $user */
        $user = Auth::user();

        // If 2FA is enabled and confirmed, defer full login to the challenge step.
        if ($user->hasEnabledTwoFactorAuthentication()) {
            Auth::guard('web')->logout();

            $request->session()->put([
                'login.id' => $user->getKey(),
                'login.remember' => $remember,
            ]);

            return response()->json(['two_factor' => true]);
        }

        $request->session()->regenerate();

        return response()->json(['message' => 'Login successful.']);
    }

    public function destroy(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out successfully.']);
    }
}
