<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Http\Resources\Mobile\CategoryResource;
use App\Models\Category;

class CategoryController extends Controller
{
    /**
     * Return all product categories.
     *
     * GET /api/mobile/v1/categories
     */
    public function index()
    {
        $categories = Category::where('type', 'product')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => CategoryResource::collection($categories),
        ]);
    }
}
