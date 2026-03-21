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

        $remember = (bool) $request->boolean('remember');
        $credentials = $request->only('email', 'password');

        if (! Auth::attempt($credentials, $remember)) {
            RateLimiter::hit($key, 900); // 15 min lockout window

            throw ValidationException::withMessages([
                'email' => ['These credentials do not match our records.'],
            ]);
        }

        RateLimiter::clear($key);

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
