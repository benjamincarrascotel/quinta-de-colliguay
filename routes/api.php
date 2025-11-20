<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MasterDataController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// NO AUTH REQUIRED
Route::middleware('guest')->group(function () {
    // MODULE: AUTH
    Route::prefix('auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    });
});

// AUTH REQUIRED
Route::middleware('auth:sanctum')->group(function () {
    // MODULE: MASTER DATA
    Route::get('/master-data', [MasterDataController::class, 'index']);
    // MODULE: AUTH
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
    });
    // MODULE: USERS
    Route::prefix('users')->group(function () {
        Route::get('/me', [UserController::class, 'me']);
    });
});
