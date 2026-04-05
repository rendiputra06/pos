<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Http\Resources\Mobile\SupplierResource;
use App\Models\Supplier;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    /**
     * List all suppliers.
     *
     * GET /api/mobile/v1/suppliers
     *   ?search=keyword
     */
    public function index(Request $request)
    {
        $suppliers = Supplier::when($request->search, function ($q, $search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('contact_person', 'like', "%{$search}%")
              ->orWhere('phone', 'like', "%{$search}%");
        })
            ->orderBy('name')
            ->paginate($request->per_page ?? 50);

        return response()->json([
            'success' => true,
            'data'    => SupplierResource::collection($suppliers),
            'meta'    => [
                'current_page' => $suppliers->currentPage(),
                'last_page'    => $suppliers->lastPage(),
                'total'        => $suppliers->total(),
            ],
        ]);
    }

    /**
     * Show a single supplier.
     *
     * GET /api/mobile/v1/suppliers/{id}
     */
    public function show(Supplier $supplier)
    {
        return response()->json([
            'success' => true,
            'data'    => new SupplierResource($supplier),
        ]);
    }

    /**
     * Create a new supplier.
     *
     * POST /api/mobile/v1/suppliers
     */
    public function store(Request $request)
    {
        $request->validate([
            'name'           => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'phone'          => 'nullable|string|max:50',
            'email'          => 'nullable|email|max:255',
            'address'        => 'nullable|string',
        ]);

        $supplier = Supplier::create($request->only([
            'name', 'contact_person', 'phone', 'email', 'address',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Supplier created successfully.',
            'data'    => new SupplierResource($supplier),
        ], 201);
    }
}
