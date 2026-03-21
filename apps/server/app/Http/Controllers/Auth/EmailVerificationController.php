<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class EmailVerificationController extends Controller
{
    public function verify(Request $request, string $id, string $hash): RedirectResponse
    {
        $frontendUrl = config('app.frontend_url');

        if (! Str::isUuid($id)) {
            return redirect("{$frontendUrl}/verify-email?error=invalid_link");
        }

        $user = User::findOrFail($id);

        // Guard: validate the hash matches the user's email (same check Laravel's EmailVerificationRequest does)
        if (! hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            return redirect("{$frontendUrl}/verify-email?error=invalid_link");
        }

        if (! $user->hasVerifiedEmail()) {
            if ($user->markEmailAsVerified()) {
                event(new Verified($user));
            }
        }

        $destination = $user->current_household_id ? '/pets' : '/onboarding';

        return redirect("{$frontendUrl}{$destination}?verified=1");
    }

    public function resend(Request $request): JsonResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified.']);
        }

        $request->user()->sendEmailVerificationNotification();

        return response()->json(['message' => 'Verification link sent.']);
    }
}
