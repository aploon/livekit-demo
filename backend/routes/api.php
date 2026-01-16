<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\VideoController;

Route::get('/video/token', [VideoController::class, 'generateToken']);