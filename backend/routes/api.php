<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerOrderController;
use App\Http\Controllers\Api\Admin\ServiceController;
use App\Http\Controllers\Api\Admin\GalleryController;
use App\Http\Controllers\Api\PublicServiceController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PublicGalleryController;
use App\Http\Controllers\Api\PublicContactMessageController;
use App\Http\Controllers\Api\PublicSiteContentController;
use App\Http\Controllers\Api\PublicAdController;
use App\Http\Controllers\Api\Admin\SiteContentController;
use App\Http\Controllers\Api\Admin\AdController;
use App\Http\Controllers\Api\Admin\SettingsController;
use App\Http\Controllers\Api\Admin\ContactMessageController;
use App\Http\Controllers\Api\Admin\OrderController;
use App\Http\Controllers\Api\Admin\UserManagementController;

// PUBLIC API
Route::get('/services', [PublicServiceController::class, 'index']);
Route::get('/galleries', [PublicGalleryController::class, 'index']);
Route::get('/site-content', [PublicSiteContentController::class, 'index']);
Route::get('/ads', [PublicAdController::class, 'index']);
Route::post('/contact-messages', [PublicContactMessageController::class, 'store'])
    ->middleware('throttle:5,1');
// PUBLIC AUTHENTICATION
Route::post('/auth/login', [AuthController::class, 'publicLogin'])
    ->middleware('throttle:5,1');

Route::post('/auth/register', [AuthController::class, 'register'])
    ->middleware('throttle:5,1');

Route::get('/auth/me', [AuthController::class, 'publicMe'])
    ->middleware('auth:sanctum');

Route::put('/auth/profile', [AuthController::class, 'updatePublicProfile'])
    ->middleware('auth:sanctum');
Route::post('/auth/logout', [AuthController::class, 'logout'])
    ->middleware('auth:sanctum');

Route::post('/orders', [CustomerOrderController::class, 'store'])
    ->middleware(['auth:sanctum', 'throttle:5,1']);

Route::get('/orders', [CustomerOrderController::class, 'index'])
    ->middleware('auth:sanctum');

Route::get('/orders/{id}', [CustomerOrderController::class, 'show'])
    ->middleware('auth:sanctum');

Route::patch('/orders/{id}/cancel', [CustomerOrderController::class, 'cancel'])
    ->middleware(['auth:sanctum', 'throttle:5,1']);

// ADMIN API
Route::prefix('admin')->group(function () {

    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:5,1');

    Route::middleware(['auth:sanctum', 'admin'])->group(function () {

        Route::get('/me', [AuthController::class, 'me']);
        Route::put('/settings/profile', [SettingsController::class, 'updateProfile']);
        Route::put('/settings/password', [SettingsController::class, 'updatePassword']);
        Route::post('/logout', [AuthController::class, 'logout']);

        // USER MANAGEMENT
        Route::get('/users', [UserManagementController::class, 'index']);
        Route::get('/users/{id}', [UserManagementController::class, 'show']);
        Route::put('/users/{id}', [UserManagementController::class, 'update']);
        // ORDER MANAGEMENT
        Route::get('/orders', [OrderController::class, 'index']);
        Route::get('/orders/{id}', [OrderController::class, 'show']);
        Route::patch('/orders/{id}', [OrderController::class, 'update']);
        // SERVICE MANAGEMENT
        Route::apiResource('/services', ServiceController::class);

        // GALLERY MANAGEMENT
        Route::apiResource('/galleries', GalleryController::class);

        // ADVERTISEMENT MANAGEMENT
        Route::apiResource('/ads', AdController::class);

        // CONTACT MESSAGE MANAGEMENT
        Route::get('/messages', [ContactMessageController::class, 'index']);
        Route::get('/messages/{id}', [ContactMessageController::class, 'show']);
        Route::patch('/messages/{id}', [ContactMessageController::class, 'update']);
        Route::delete('/messages/{id}', [ContactMessageController::class, 'destroy']);

        // WEBSITE CONTENT MANAGEMENT
        Route::get('/site-content', [SiteContentController::class, 'index']);
        Route::put('/site-content', [SiteContentController::class, 'update']);
        Route::post('/site-content/hero-image', [SiteContentController::class, 'uploadHeroImage']);
        Route::post('/site-content/ad-image/{slot}', [SiteContentController::class, 'uploadAdImage'])->whereIn('slot', ['1', '2']);

    });

});


