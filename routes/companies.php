<?php

use App\Http\Controllers\Web\CompanyController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:superadmin'])
    ->prefix('companies')
    ->name('companies.')
    ->group(function () {
        Route::get('/', [CompanyController::class, 'index'])->name('index');
        Route::get('/create', [CompanyController::class, 'create'])->name('create');
        Route::post('/', [CompanyController::class, 'store'])->name('store');
        Route::put('/{company}', [CompanyController::class, 'update'])->name('update');
        Route::patch('/{company}', [CompanyController::class, 'update']);
        Route::delete('/{company}', [CompanyController::class, 'destroy'])->name('destroy');
    });
