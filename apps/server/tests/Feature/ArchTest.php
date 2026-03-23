<?php

declare(strict_types=1);

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
