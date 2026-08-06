<?php

declare(strict_types=1);

namespace App\Providers;

use App\Contracts\BusinessSource;
use App\Contracts\Geocoder;
use App\Contracts\OutreachGateway;
use App\Services\Geocoding\NullGeocoder;
use App\Services\Outreach\NullOutreachGateway;
use App\Services\Sources\NullBusinessSource;
use App\Services\Sources\Parser2gisBusinessSource;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            BusinessSource::class,
            config('leads.source_driver') === 'parser2gis'
                ? Parser2gisBusinessSource::class
                : NullBusinessSource::class,
        );
        $this->app->bind(Geocoder::class, NullGeocoder::class);
        $this->app->bind(OutreachGateway::class, NullOutreachGateway::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
