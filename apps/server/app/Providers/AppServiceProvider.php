<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\MedicationAdministration;
use App\Models\PetWeight;
use App\Models\User;
use App\Policies\MedicationAdministrationPolicy;
use App\Policies\PetWeightPolicy;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
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
        Model::shouldBeStrict(! app()->isProduction());

        RateLimiter::for('api', function (Request $request): Limit {
            return Limit::perMinute(120)->by($request->user()?->id ?: $request->ip());
        });

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
        Gate::policy(PetWeight::class, PetWeightPolicy::class);

        VerifyEmail::toMailUsing(function (mixed $notifiable, string $url): MailMessage {
            return (new MailMessage)
                ->subject('Verify Your Email Address — FurLog')
                ->markdown('notifications.verify-email', [
                    'name' => $notifiable->name,
                    'url' => $url,
                ]);
        });
    }
}
