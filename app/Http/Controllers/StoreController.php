<?php

namespace App\Http\Controllers;

use App\Models\Store;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class StoreController extends Controller
{
    /**
     * Display a listing of the stores.
     * Only accessible by Super Admin.
     */
    public function index(Request $request)
    {
        if (!$this->isAuthorized()) {
            abort(403, 'Hanya Super Admin atau Admin yang dapat mengakses halaman ini.');
        }

        $query = Store::latest();

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%");
            });
        }

        return Inertia::render('stores/Index', [
            'stores' => $query->paginate(10)->withQueryString(),
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Check if user is authorized for store management.
     */
    private function isAuthorized(): bool
    {
        $user = auth()->user();
        return $user->isSuperAdmin() || $user->isAdmin();
    }

    /**
     * Show the form for creating a new store.
     */
    public function create()
    {
        if (!$this->isAuthorized()) {
            abort(403, 'Hanya Super Admin atau Admin yang dapat membuat toko.');
        }

        return Inertia::render('stores/Form');
    }

    /**
     * Store a newly created store in storage.
     */
    public function store(Request $request)
    {
        if (!$this->isAuthorized()) {
            abort(403, 'Hanya Super Admin atau Admin yang dapat membuat toko.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:stores,slug',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'is_active' => 'required|boolean',
            'receipt_header' => 'nullable|string',
            'receipt_footer' => 'nullable|string',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        // Ensure unique slug
        $originalSlug = $validated['slug'];
        $counter = 1;
        while (Store::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $originalSlug . '-' . $counter;
            $counter++;
        }

        Store::create($validated);

        return redirect()->route('stores.index')->with('success', 'Toko berhasil dibuat.');
    }

    /**
     * Show the form for editing the specified store.
     */
    public function edit(Store $store)
    {
        if (!$this->isAuthorized()) {
            abort(403, 'Hanya Super Admin atau Admin yang dapat mengedit toko.');
        }

        return Inertia::render('stores/Form', [
            'store' => $store,
        ]);
    }

    /**
     * Update the specified store in storage.
     */
    public function update(Request $request, Store $store)
    {
        if (!$this->isAuthorized()) {
            abort(403, 'Hanya Super Admin atau Admin yang dapat mengupdate toko.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:stores,slug,' . $store->id,
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'is_active' => 'required|boolean',
            'receipt_header' => 'nullable|string',
            'receipt_footer' => 'nullable|string',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        // Ensure unique slug (if changed and conflicts with another store)
        if ($validated['slug'] !== $store->slug) {
            $originalSlug = $validated['slug'];
            $counter = 1;
            while (Store::where('slug', $validated['slug'])->where('id', '!=', $store->id)->exists()) {
                $validated['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }
        }

        $store->update($validated);

        return redirect()->route('stores.index')->with('success', 'Toko berhasil diperbarui.');
    }

    /**
     * Remove the specified store from storage.
     */
    public function destroy(Store $store)
    {
        if (!$this->isAuthorized()) {
            abort(403, 'Hanya Super Admin atau Admin yang dapat menghapus toko.');
        }

        // Check if store has related data
        $hasRelations = $store->users()->exists() ||
                         $store->storeProducts()->exists() ||
                         $store->transactions()->exists() ||
                         $store->suppliers()->exists() ||
                         $store->purchases()->exists() ||
                         $store->expenses()->exists() ||
                         $store->services()->exists();

        if ($hasRelations) {
            return redirect()->route('stores.index')
                ->with('error', 'Toko tidak dapat dihapus karena masih memiliki data terkait (users, products, transactions, dll).');
        }

        $store->delete();

        return redirect()->route('stores.index')->with('success', 'Toko berhasil dihapus.');
    }

    /**
     * Switch current store (Super Admin only)
     */
    public function switchStore(Request $request)
    {
        if (!auth()->user()->isSuperAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'store_id' => 'required|exists:stores,id',
        ]);

        $user = auth()->user();
        $user->store_id = $validated['store_id'];
        $user->save();

        return back()->with('success', 'Pindah toko berhasil.');
    }
}
