<?php

namespace App\Providers;

use App\Services\BookingService;
use App\Services\Contracts\BookingServiceInterface;
use App\Services\Contracts\ServiceServiceInterface;
use App\Services\Contracts\ServiceTypeServiceInterface;
use App\Services\ServiceService;
use App\Services\ServiceTypeService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(ServiceServiceInterface::class, ServiceService::class);
        $this->app->bind(ServiceTypeServiceInterface::class, ServiceTypeService::class);
        $this->app->bind(BookingServiceInterface::class, BookingService::class);

        // NotificationService is auto-resolved.
    }

    public function boot(): void
    {
        // Notifications are shared via app/Http/Middleware/HandleInertiaRequests.php
    }
}
