<?php

use App\Http\Controllers\Api\AvailabilityController;
use App\Http\Controllers\Api\ReservationRequestController;
use App\Http\Controllers\Api\ParametersController;
use App\Http\Controllers\Api\Admin\AdminReservationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Rutas públicas
Route::prefix('v1')->group(function () {
    // Disponibilidad del calendario
    Route::get('/availability', [AvailabilityController::class, 'index'])
        ->name('api.availability');

    // Crear solicitud de reserva
    Route::post('/requests', [ReservationRequestController::class, 'store'])
        ->name('api.requests.store')
        ->middleware('throttle:10,1'); // Max 10 solicitudes por minuto

    // Parámetros del sistema (precios, límites)
    Route::get('/parameters', [ParametersController::class, 'index'])
        ->name('api.parameters');
});

// Rutas administrativas (requieren autenticación)
Route::prefix('v1/admin')->middleware(['auth:sanctum'])->group(function () {
    // Gestión de reservas
    Route::get('/requests', [AdminReservationController::class, 'index'])
        ->name('api.admin.requests.index');

    Route::get('/requests/{reservation}', [AdminReservationController::class, 'show'])
        ->name('api.admin.requests.show');

    Route::patch('/requests/{reservation}', [AdminReservationController::class, 'update'])
        ->name('api.admin.requests.update');

    Route::post('/requests/{reservation}/confirm', [AdminReservationController::class, 'confirm'])
        ->name('api.admin.requests.confirm');

    Route::post('/requests/{reservation}/cancel', [AdminReservationController::class, 'cancel'])
        ->name('api.admin.requests.cancel');

    // Descargar calendario (.ics)
    Route::get('/requests/{reservation}/calendar', [AdminReservationController::class, 'downloadCalendar'])
        ->name('api.admin.requests.calendar');

    // Exportar CSV
    Route::get('/requests/export/csv', [AdminReservationController::class, 'exportCsv'])
        ->name('api.admin.requests.export');
});
