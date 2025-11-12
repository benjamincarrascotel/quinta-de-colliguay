<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Contracts\ReservationRepositoryInterface;
use App\Repositories\ReservationRepository;
use App\Contracts\ClientRepositoryInterface;
use App\Repositories\ClientRepository;
use App\Contracts\ParameterRepositoryInterface;
use App\Repositories\ParameterRepository;

/**
 * Repository Service Provider
 * Registra las interfaces con sus implementaciones concretas
 * Permite dependency injection y facilita testing
 */
class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->bind(ReservationRepositoryInterface::class, ReservationRepository::class);
        $this->app->bind(ClientRepositoryInterface::class, ClientRepository::class);
        $this->app->bind(ParameterRepositoryInterface::class, ParameterRepository::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
