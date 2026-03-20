<?php

declare(strict_types=1);

use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\HouseholdController;
use App\Http\Controllers\PetController;
use App\Http\Controllers\PetWeightController;
use App\Http\Controllers\VetClinicController;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('health', function (): JsonResponse {
    return response()->json(['status' => 'ok']);
});

// Auth routes (guest only)
Route::middleware('guest')->prefix('auth')->group(function () {
    Route::post('register', RegisterController::class)
        ->middleware('throttle:5,1')
        ->name('auth.register');

    Route::post('login', LoginController::class)
        ->middleware('throttle:5,1')
        ->name('auth.login');

    Route::post('forgot-password', ForgotPasswordController::class)
        ->middleware('throttle:3,1')
        ->name('auth.forgot-password');
});

// Auth routes (authenticated)
Route::middleware('auth:sanctum')->prefix('auth')->group(function () {
    Route::post('logout', [LoginController::class, 'destroy'])->name('auth.logout');

    Route::post('email/verification-notification', [EmailVerificationController::class, 'resend'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    Route::get('email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
        ->middleware('signed')
        ->name('verification.verify');
});

// Authenticated user
Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::get('user', function (Request $request): User {
        return $request->user()->load('currentHousehold');
    })->name('user');

    // Onboarding
    Route::post('households', [HouseholdController::class, 'store'])->name('households.store');

    // Pets
    Route::apiResource('pets', PetController::class);
    Route::post('pets/{pet}/avatar', [PetController::class, 'uploadAvatar']);
    Route::apiResource('pets.weights', PetWeightController::class)->only(['index', 'store']);

    // Vet Clinics
    Route::apiResource('vet-clinics', VetClinicController::class);
});
