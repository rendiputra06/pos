<?php

namespace App\Http\Controllers;

use App\Models\Store;
use App\Models\StoreProduct;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class StoreDirectoryController extends Controller
{
    /**
     * Display public store directory.
     */
    public function index(Request $request)
    {
        $query = Store::where('is_active', true)
            ->withCount(['storeProducts' => function ($query) {
                $query->where('is_active', true);
            }])
            ->withCount(['transactions' => function ($query) {
                $query->whereDate('created_at', '>=', now()->subDays(30));
            }]);

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Location filtering
        if ($request->filled('location')) {
            $location = $request->input('location');
            $query->where('address', 'like', "%{$location}%");
        }

        // Sort options
        $sortBy = $request->input('sort', 'name');
        $sortDirection = $request->input('direction', 'asc');
        
        if ($sortBy === 'name') {
            $query->orderBy('name', $sortDirection);
        } elseif ($sortBy === 'products') {
            $query->orderBy('store_products_count', $sortDirection);
        } elseif ($sortBy === 'transactions') {
            $query->orderBy('transactions_count', $sortDirection);
        }

        $stores = $query->paginate(12)->withQueryString();

        // Get featured stores (top performers)
        $featuredStores = Store::where('is_active', true)
            ->withCount(['transactions' => function ($query) {
                $query->whereDate('created_at', '>=', now()->subDays(30));
            }])
            ->orderBy('transactions_count', 'desc')
            ->limit(6)
            ->get();

        // Get statistics
        $stats = [
            'total_stores' => Store::where('is_active', true)->count(),
            'total_products' => StoreProduct::where('is_active', true)->count(),
            'total_transactions' => Transaction::whereDate('created_at', '>=', now()->subDays(30))->count(),
        ];

        return Inertia::render('stores/directory', [
            'stores' => $stores,
            'featuredStores' => $featuredStores,
            'stats' => $stats,
            'filters' => $request->only(['search', 'location', 'sort', 'direction']),
        ]);
    }

    /**
     * Search stores for autocomplete.
     */
    public function search(Request $request)
    {
        $query = $request->input('q');
        
        if (empty($query)) {
            return response()->json([]);
        }

        $stores = Store::where('is_active', true)
            ->where('name', 'like', "%{$query}%")
            ->limit(10)
            ->get(['id', 'name', 'slug', 'address']);

        return response()->json($stores);
    }

    /**
     * Display specific store details.
     */
    public function show($slug)
    {
        $store = Store::where('slug', $slug)
            ->where('is_active', true)
            ->with([
                'storeProducts' => function ($query) {
                    $query->where('is_active', true)
                          ->with('productBank.category')
                          ->orderBy('name');
                },
                'transactions' => function ($query) {
                    $query->latest()
                          ->limit(10);
                }
            ])
            ->firstOrFail();

        // Get store statistics
        $stats = [
            'total_products' => $store->storeProducts()->where('is_active', true)->count(),
            'total_transactions' => $store->transactions()->count(),
            'revenue_this_month' => $store->transactions()
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('total'),
            'revenue_last_month' => $store->transactions()
                ->whereMonth('created_at', now()->subMonth()->month)
                ->whereYear('created_at', now()->subMonth()->year)
                ->sum('total'),
        ];

        // Get product categories
        $categories = $store->storeProducts()
            ->where('is_active', true)
            ->with('productBank.category')
            ->get()
            ->pluck('productBank.category.name')
            ->filter()
            ->unique()
            ->values();

        // Get operating hours (mock data for now)
        $operatingHours = [
            'monday' => '08:00 - 22:00',
            'tuesday' => '08:00 - 22:00',
            'wednesday' => '08:00 - 22:00',
            'thursday' => '08:00 - 22:00',
            'friday' => '08:00 - 22:00',
            'saturday' => '09:00 - 23:00',
            'sunday' => '09:00 - 21:00',
        ];

        // Get nearby stores (same city/area)
        $nearbyStores = Store::where('is_active', true)
            ->where('id', '!=', $store->id)
            ->where(function ($query) use ($store) {
                // Simple proximity check by matching address parts
                $addressParts = explode(' ', $store->address);
                foreach ($addressParts as $part) {
                    if (strlen($part) > 2) {
                        $query->orWhere('address', 'like', "%{$part}%");
                    }
                }
            })
            ->limit(4)
            ->get(['id', 'name', 'slug', 'address']);

        return Inertia::render('stores/detail', [
            'store' => $store,
            'stats' => $stats,
            'categories' => $categories,
            'operatingHours' => $operatingHours,
            'nearbyStores' => $nearbyStores,
        ]);
    }
}
