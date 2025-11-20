<?php

use App\Http\Controllers\Web\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:superadmin|admin'])
    ->prefix('users')
    ->name('users.')
    ->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('index');
        Route::get('/create', [UserController::class, 'create'])->name('create');
        Route::post('/', [UserController::class, 'store'])->name('store');
        Route::put('/{user}', [UserController::class, 'update'])->name('update');
        Route::patch('/{user}', [UserController::class, 'update']);
        Route::delete('/{user}', [UserController::class, 'destroy'])->name('destroy');
        Route::get('change-password', [UserController::class, 'changePasswordForm'])->name('changePasswordForm');
        Route::put('{user}/change-password', [UserController::class, 'updatePassword'])->name('changePasswordUpdate');
    });
