<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Service;
use App\Models\ServicePriceLevel;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ServiceController extends Controller
{
    public function index(Request $request)
    {
        $services = Service::with(['category', 'priceLevels'])
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('services/Index', [
            'services' => $services,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('services/Form', [
            'categories' => Category::where('type', 'service')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'base_price' => 'required|numeric|min:0',
            'price_levels' => 'nullable|array',
            'price_levels.*.min_qty' => 'required|integer|min:1',
            'price_levels.*.max_qty' => 'nullable|integer|min:1',
            'price_levels.*.price' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated) {
            $service = Service::create([
                'category_id' => $validated['category_id'],
                'name' => $validated['name'],
                'base_price' => $validated['base_price'],
            ]);

            if (!empty($validated['price_levels'])) {
                foreach ($validated['price_levels'] as $level) {
                    $service->priceLevels()->create($level);
                }
            }
        });

        return redirect()->route('services.index')->with('success', 'Layanan jasa berhasil dibuat.');
    }

    public function edit(Service $service)
    {
        return Inertia::render('services/Form', [
            'service' => $service->load('priceLevels'),
            'categories' => Category::where('type', 'service')->get(),
        ]);
    }

    public function update(Request $request, Service $service)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'base_price' => 'required|numeric|min:0',
            'price_levels' => 'nullable|array',
            'price_levels.*.min_qty' => 'required|integer|min:1',
            'price_levels.*.max_qty' => 'nullable|integer|min:1',
            'price_levels.*.price' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated, $service) {
            $service->update([
                'category_id' => $validated['category_id'],
                'name' => $validated['name'],
                'base_price' => $validated['base_price'],
            ]);

            $service->priceLevels()->delete();

            if (!empty($validated['price_levels'])) {
                foreach ($validated['price_levels'] as $level) {
                    $service->priceLevels()->create($level);
                }
            }
        });

        return redirect()->route('services.index')->with('success', 'Layanan jasa berhasil diperbarui.');
    }

    public function destroy(Service $service)
    {
        $service->delete();

        return redirect()->route('services.index')->with('success', 'Layanan jasa berhasil dihapus.');
    }
}
