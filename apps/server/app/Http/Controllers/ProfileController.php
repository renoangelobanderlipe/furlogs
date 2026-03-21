<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Fortify\UpdateUserPassword;
use App\Http\Requests\UpdateNotificationPreferencesRequest;
use App\Http\Requests\UpdateProfileRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function __construct(private readonly UpdateUserPassword $updateUserPassword) {}

    /**
     * Update the authenticated user's profile name.
     */
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $request->user()->update([
            'name' => $request->string('name')->toString(),
        ]);

        return response()->json(['data' => $request->user()->fresh()]);
    }

    /**
     * Change the authenticated user's password.
     */
    public function changePassword(Request $request): JsonResponse
    {
        $this->updateUserPassword->update($request->user(), $request->all());

        return response()->json(['message' => 'Password updated successfully.']);
    }

    /**
     * Return the authenticated user's notification preferences.
     */
    public function notificationPreferences(Request $request): JsonResponse
    {
        return response()->json(['data' => $request->user()->notification_preferences]);
    }

    /**
     * Merge the given preferences into the authenticated user's notification preferences.
     */
    public function updateNotificationPreferences(UpdateNotificationPreferencesRequest $request): JsonResponse
    {
        $user = $request->user();
        $current = $user->notification_preferences ?? [];
        $user->update(['notification_preferences' => array_merge($current, $request->validated())]);

        return response()->json(['data' => $user->fresh()->notification_preferences]);
    }
}
