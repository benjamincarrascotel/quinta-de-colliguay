<?php

use App\Http\Controllers\BookingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Booking Routes
|--------------------------------------------------------------------------
|
| Public-facing booking system routes.
| These routes are accessible without authentication.
|
*/

// Booking wizard - Step 1, 2, 3
Route::get('/booking', [BookingController::class, 'index'])->name('booking.index');

// Submit booking
Route::post('/booking/submit', [BookingController::class, 'submit'])->name('booking.submit');

// Get availability data (API endpoint for future use)
Route::get('/api/booking/availability', [BookingController::class, 'availability'])->name('booking.availability');
