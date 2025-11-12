<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return ['message' => 'Quinta de Colliguay API', 'version' => '1.0.0'];
});
