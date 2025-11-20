<?php

use Illuminate\Support\Facades\Route;

// Public booking system (no authentication required)
require __DIR__.'/booking.php';

// Redirect root to booking
Route::get('/', function () {
    return redirect()->route('booking.index');
})->name('home');

require __DIR__.'/dashboard.php';
require __DIR__.'/settings.php';
require __DIR__.'/users.php';
require __DIR__.'/companies.php';
require __DIR__.'/production_centers.php';
require __DIR__.'/auth.php';
