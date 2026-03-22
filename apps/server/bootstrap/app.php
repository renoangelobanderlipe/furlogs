<?php

declare(strict_types=1);

use App\Http\Middleware\SetPermissionsTeamId;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // TODO(production): Restrict to known proxy CIDR ranges before launch.
        // Using '*' here makes the client IP unreliable — a secondary email-based rate limiter
        // in LoginController compensates, but this should be locked down to specific IPs/CIDRs.
        $middleware->trustProxies(at: '*');
        $middleware->statefulApi();
        $middleware->appendToGroup('api', SetPermissionsTeamId::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
