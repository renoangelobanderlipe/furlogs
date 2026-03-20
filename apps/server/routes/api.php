<?php

declare(strict_types=1);

use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\FoodProductController;
use App\Http\Controllers\FoodStockItemController;
use App\Http\Controllers\HouseholdController;
use App\Http\Controllers\MedicationController;
use App\Http\Controllers\PetController;
use App\Http\Controllers\PetWeightController;
use App\Http\Controllers\VaccinationController;
use App\Http\Controllers\VetClinicController;
use App\Http\Controllers\VetVisitAttachmentController;
use App\Http\Controllers\VetVisitController;
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

    // Food Products
    Route::apiResource('food-products', FoodProductController::class);
    Route::post('food-products/{food_product}/consumption-rates', [FoodProductController::class, 'storeConsumptionRate']);
    Route::delete('food-products/{food_product}/consumption-rates/{pet}', [FoodProductController::class, 'destroyConsumptionRate']);

    // Food Stock Items
    Route::apiResource('food-stock-items', FoodStockItemController::class);
    Route::patch('food-stock-items/{food_stock_item}/open', [FoodStockItemController::class, 'open']);
    Route::patch('food-stock-items/{food_stock_item}/finish', [FoodStockItemController::class, 'markFinished']);

    // Projections
    Route::get('food-stock/projections', [FoodStockItemController::class, 'projections']);

    // Vet Visits — non-resource routes must be registered before the resource route
    Route::get('vet-visits/stats', [VetVisitController::class, 'stats'])->name('vet-visits.stats');
    Route::delete('vet-visits/bulk', [VetVisitController::class, 'bulkDestroy'])->name('vet-visits.bulk-destroy');
    Route::apiResource('vet-visits', VetVisitController::class);
    Route::post('vet-visits/{vet_visit}/attachments', [VetVisitAttachmentController::class, 'store'])->name('vet-visits.attachments.store');
    Route::delete('vet-visits/{vet_visit}/attachments/{mediaId}', [VetVisitAttachmentController::class, 'destroy'])->name('vet-visits.attachments.destroy');

    // Vaccinations
    Route::apiResource('vaccinations', VaccinationController::class);

    // Medications
    Route::apiResource('medications', MedicationController::class);
});
