<?php

declare(strict_types=1);

use App\Http\Controllers\BusinessController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\MapController;
use App\Http\Controllers\ScanController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function (): void {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');
    Route::get('/map', MapController::class)->name('map');

    Route::get('/businesses', [BusinessController::class, 'index'])->name('businesses.index');
    Route::patch('/businesses/{business}/status', [BusinessController::class, 'updateStatus'])
        ->name('businesses.status');

    Route::get('/imports', [ImportController::class, 'index'])->name('imports.index');
    Route::post('/imports', [ImportController::class, 'store'])->name('imports.store');
    Route::get('/imports/{import}', [ImportController::class, 'show'])->name('imports.show');
    Route::post('/imports/{import}/map', [ImportController::class, 'mapColumns'])->name('imports.map');

    Route::get('/scans', [ScanController::class, 'index'])->name('scans.index');
    Route::post('/scans', [ScanController::class, 'store'])->name('scans.store');
});

require __DIR__.'/settings.php';
