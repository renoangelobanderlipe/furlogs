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
        // Set TRUSTED_PROXIES env var to restrict to known CIDR ranges in production
        // (e.g. "10.0.0.0/8,172.16.0.0/12" for your load balancer ranges).
        // '*' is the insecure default that allows IP spoofing — configure before launch.
        $middleware->trustProxies(at: env('TRUSTED_PROXIES', '*'));
        $middleware->statefulApi();
        $middleware->appendToGroup('api', SetPermissionsTeamId::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
