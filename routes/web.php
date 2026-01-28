<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BackupController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\UserFileController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\SettingAppController;
use App\Http\Controllers\MediaFolderController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\PosController;
use App\Http\Controllers\Api\PosApiController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\ExpenseController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'menu.permission'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::resource('roles', RoleController::class);
    Route::resource('menus', MenuController::class);
    Route::post('menus/reorder', [MenuController::class, 'reorder'])->name('menus.reorder');
    Route::resource('permissions', PermissionController::class);
    Route::resource('users', UserController::class);
    Route::put('/users/{user}/reset-password', [UserController::class, 'resetPassword'])->name('users.reset-password');
    Route::get('/settingsapp', [SettingAppController::class, 'edit'])->name('setting.edit');
    Route::post('/settingsapp', [SettingAppController::class, 'update'])->name('setting.update');
    Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
    Route::get('/backup', [BackupController::class, 'index'])->name('backup.index');
    Route::post('/backup/run', [BackupController::class, 'run'])->name('backup.run');
    Route::get('/backup/download/{file}', [BackupController::class, 'download'])->name('backup.download');
    Route::delete('/backup/delete/{file}', [BackupController::class, 'delete'])->name('backup.delete');
    Route::get('/files', [UserFileController::class, 'index'])->name('files.index');
    Route::post('/files', [UserFileController::class, 'store'])->name('files.store');
    Route::delete('/files/{id}', [UserFileController::class, 'destroy'])->name('files.destroy');
    Route::resource('media', MediaFolderController::class);
    Route::resource('categories', CategoryController::class);
    Route::resource('products', ProductController::class);
    Route::resource('services', ServiceController::class);
    Route::resource('expenses', ExpenseController::class);

    // POS Routes
    Route::get('/pos', [PosController::class, 'index'])->name('pos.index');
    Route::get('/pos/receipt/{transaction}', [PosController::class, 'receipt'])->name('pos.receipt');
    Route::get('/api/pos/search', [PosApiController::class, 'search'])->name('api.pos.search');
    Route::post('/api/pos/transaction', [PosApiController::class, 'store'])->name('api.pos.store');

    // Reports Routes
    Route::get('/reports/sales', [ReportController::class, 'sales'])->name('reports.sales');
    Route::get('/reports/profit-loss', [ReportController::class, 'profitLoss'])->name('reports.profit-loss');
    Route::get('/reports/export/sales', [ReportController::class, 'exportSales'])->name('reports.export.sales');

    // Analytics API Routes
    Route::get('/api/analytics/dashboard', [AnalyticsController::class, 'dashboard'])->name('api.analytics.dashboard');
    Route::get('/api/analytics/sales-trend', [AnalyticsController::class, 'salesTrend'])->name('api.analytics.sales-trend');
    Route::get('/api/analytics/category-breakdown', [AnalyticsController::class, 'categoryBreakdown'])->name('api.analytics.category-breakdown');
    Route::get('/api/analytics/profit-loss', [AnalyticsController::class, 'profitLoss'])->name('api.analytics.profit-loss');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
