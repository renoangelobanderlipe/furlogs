<?php

declare(strict_types=1);

arch()->preset()->php();

// Controllers across this app use domain-specific action methods beyond standard CRUD
// (e.g. complete, snooze, unreadCount, bulkDestroy, uploadAvatar). The custom arch checks
// below already enforce naming and structure conventions for controllers.
// PruneExpiredInvitations intentionally omits the Command suffix (class name describes the domain action).
arch()->preset()->laravel()
    ->ignoring('App\Http\Controllers')
    ->ignoring('App\Console\Commands\PruneExpiredInvitations');

// DevSeeder uses shuffle() for intentional random seeding.
// EmailVerificationController uses sha1() as required by Laravel's signed URL verification spec.
// PruneExpiredInvitations does not follow the Command suffix convention (intentional).
arch()->preset()->security()
    ->ignoring('Database\Seeders\DevSeeder')
    ->ignoring('App\Http\Controllers\Auth\EmailVerificationController')
    ->ignoring('App\Console\Commands\PruneExpiredInvitations');

arch('all App classes use strict types')
    ->expect('App')
    ->toUseStrictTypes();

arch('controllers have Controller suffix')
    ->expect('App\Http\Controllers')
    ->toHaveSuffix('Controller');

arch('services have Service suffix')
    ->expect('App\Services')
    ->toHaveSuffix('Service');

arch('form requests have Request suffix')
    ->expect('App\Http\Requests')
    ->toHaveSuffix('Request');

arch('policies have Policy suffix')
    ->expect('App\Policies')
    ->toHaveSuffix('Policy');

arch('enums are string-backed enums')
    ->expect('App\Enums')
    ->toBeStringBackedEnum();

arch('models do not define $guarded')
    ->expect('App\Models')
    ->not->toHaveProperty('guarded');
