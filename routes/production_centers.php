<?php

use App\Http\Controllers\Web\ProductionCenterController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:superadmin|admin'])
    ->prefix('production-centers')
    ->name('production_centers.')
    ->group(function () {
        Route::get('/', [ProductionCenterController::class, 'index'])->name('index');
        Route::get('/create', [ProductionCenterController::class, 'create'])->name('create');
        Route::post('/', [ProductionCenterController::class, 'store'])->name('store');
        Route::put('/{production_center}', [ProductionCenterController::class, 'update'])->name('update');
        Route::delete('/{production_center}', [ProductionCenterController::class, 'destroy'])->name('destroy');
    });
