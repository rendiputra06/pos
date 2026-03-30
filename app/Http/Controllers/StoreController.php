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
    public function index()
    {
        return Inertia::render('stores/Index', [
            'stores' => Store::latest()->paginate(10),
        ]);
    }

    /**
     * Show the form for creating a new store.
     */
    public function create()
    {
        return Inertia::render('stores/Form');
    }

    /**
     * Store a newly created store in storage.
     */
    public function store(Request $request)
    {
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

        Store::create($validated);

        return redirect()->route('stores.index')->with('success', 'Toko berhasil dibuat.');
    }

    /**
     * Show the form for editing the specified store.
     */
    public function edit(Store $store)
    {
        return Inertia::render('stores/Form', [
            'store' => $store,
        ]);
    }

    /**
     * Update the specified store in storage.
     */
    public function update(Request $request, Store $store)
    {
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

        $store->update($validated);

        return redirect()->route('stores.index')->with('success', 'Toko berhasil diperbarui.');
    }

    /**
     * Remove the specified store from storage.
     */
    public function destroy(Store $store)
    {
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
