<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Mobile\AuthController;
use App\Http\Controllers\Api\Mobile\DashboardController;
use App\Http\Controllers\Api\Mobile\CategoryController;
use App\Http\Controllers\Api\Mobile\ProductController;
use App\Http\Controllers\Api\Mobile\VariantController;
use App\Http\Controllers\Api\Mobile\SupplierController;
use App\Http\Controllers\Api\Mobile\PurchaseController;

/*
|--------------------------------------------------------------------------
| Mobile API Routes
|--------------------------------------------------------------------------
| Prefix  : /api/mobile/v1
| Auth    : Laravel Sanctum (Bearer Token)
|
*/

Route::prefix('mobile/v1')->group(function () {

    // ─── Public Routes (no auth required) ───────────────────────────────
    Route::post('login', [AuthController::class, 'login']);

    // ─── Protected Routes (require Sanctum token) ───────────────────────
    Route::middleware('auth:sanctum')->group(function () {

        // Auth
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);

        // Dashboard
        Route::get('dashboard', [DashboardController::class, 'index']);

        // Categories (read-only for mobile)
        Route::get('categories', [CategoryController::class, 'index']);

        // Products
        Route::get('products/low-stock', [ProductController::class, 'lowStock']);
        Route::get('products/barcode/{code}', [ProductController::class, 'findByBarcode']);
        Route::post('products/{product}/images', [ProductController::class, 'uploadImage']);
        Route::delete('products/{product}/images/{media}', [ProductController::class, 'removeImage']);
        Route::apiResource('products', ProductController::class);

        // Variants & Variant Categories (nested under products)
        Route::prefix('products/{product}')->group(function () {
            // Variant Groups & Options
            Route::get('variant-groups', [VariantController::class, 'indexGroups']);
            Route::post('variant-groups', [VariantController::class, 'storeGroup']);
            Route::put('variant-groups/{group}', [VariantController::class, 'updateGroup']);
            Route::delete('variant-groups/{group}', [VariantController::class, 'destroyGroup']);
            
            Route::post('variant-groups/{group}/options', [VariantController::class, 'storeOption']);
            Route::put('variant-groups/{group}/options/{option}', [VariantController::class, 'updateOption']);
            Route::delete('variant-groups/{group}/options/{option}', [VariantController::class, 'destroyOption']);

            // Auto-generation
            Route::post('generate-variants', [VariantController::class, 'generateVariants']);

            // Individual Variants
            Route::get('variants', [VariantController::class, 'index']);
            Route::post('variants', [VariantController::class, 'store']);
            Route::put('variants/{variant}', [VariantController::class, 'update']);
            Route::delete('variants/{variant}', [VariantController::class, 'destroy']);
            Route::post('variants/{variant}/image', [VariantController::class, 'uploadVariantImage']);
            Route::delete('variants/{variant}/image', [VariantController::class, 'removeVariantImage']);
        });

        // Suppliers
        Route::apiResource('suppliers', SupplierController::class)->only(['index', 'show', 'store']);

        // Purchases (Stock In)
        Route::get('purchases', [PurchaseController::class, 'index']);
        Route::post('purchases', [PurchaseController::class, 'store']);
        Route::get('purchases/{purchase}', [PurchaseController::class, 'show']);
        Route::patch('purchases/{purchase}/status', [PurchaseController::class, 'updateStatus']);
    });
});
