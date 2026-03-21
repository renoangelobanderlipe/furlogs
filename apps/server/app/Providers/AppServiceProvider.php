<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\MedicationAdministration;
use App\Models\User;
use App\Policies\MedicationAdministrationPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Password::defaults(function () {
            return Password::min(8)
                ->mixedCase()
                ->numbers()
                ->uncompromised();
        });

        Gate::define('viewApiDocs', function (?User $user = null): bool {
            return app()->environment('local');
        });

        Gate::policy(MedicationAdministration::class, MedicationAdministrationPolicy::class);
    }
}
