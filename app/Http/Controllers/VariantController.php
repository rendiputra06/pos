<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\VariantGroup;
use App\Models\VariantOption;
use App\Models\ProductVariant;
use App\Exports\VariantExport;
use App\Imports\VariantImport;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class VariantController extends Controller
{
    /**
     * Get all variant groups for a product
     */
    public function index(Product $product)
    {
        $variantGroups = $product->variantGroups()->with('options')->get();
        $variants = $product->variants()->get();

        return Inertia::render('products/variants/Index', [
            'product' => $product,
            'variantGroups' => $variantGroups,
            'variants' => $variants,
        ]);
    }

    /**
     * Create new variant group
     */
    public function storeGroup(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:size,color,material',
            'is_required' => 'boolean',
        ]);

        $variantGroup = $product->variantGroups()->create([
            'name' => $validated['name'],
            'type' => $validated['type'],
            'display_order' => $product->variantGroups()->count(),
            'is_required' => $validated['is_required'] ?? false,
        ]);

        // Add standard options
        $standardOptions = VariantGroup::getStandardOptions($validated['type']);
        foreach ($standardOptions as $index => $option) {
            $variantGroup->options()->create([
                'value' => $option['value'],
                'display_value' => $option['display_value'],
                'color_code' => $option['color_code'] ?? null,
                'display_order' => $index,
            ]);
        }

        return back()->with('success', 'Variant group berhasil ditambahkan.');
    }

    /**
     * Update variant group
     */
    public function updateGroup(Request $request, Product $product, VariantGroup $variantGroup)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'is_required' => 'boolean',
        ]);

        $variantGroup->update($validated);

        return back()->with('success', 'Variant group berhasil diperbarui.');
    }

    /**
     * Delete variant group
     */
    public function destroyGroup(Product $product, VariantGroup $variantGroup)
    {
        $variantGroup->delete();

        return back()->with('success', 'Variant group berhasil dihapus.');
    }

    /**
     * Add option to variant group
     */
    public function storeOption(Request $request, Product $product, VariantGroup $variantGroup)
    {
        $validated = $request->validate([
            'value' => 'required|string|max:255',
            'display_value' => 'required|string|max:255',
            'color_code' => 'nullable|string|max:7',
        ]);

        $variantGroup->options()->create([
            'value' => $validated['value'],
            'display_value' => $validated['display_value'],
            'color_code' => $validated['color_code'],
            'display_order' => $variantGroup->options()->count(),
        ]);

        return back()->with('success', 'Option berhasil ditambahkan.');
    }

    /**
     * Update variant option
     */
    public function updateOption(Request $request, Product $product, VariantGroup $variantGroup, VariantOption $option)
    {
        $validated = $request->validate([
            'value' => 'required|string|max:255',
            'display_value' => 'required|string|max:255',
            'color_code' => 'nullable|string|max:7',
            'is_active' => 'boolean',
        ]);

        $option->update($validated);

        return back()->with('success', 'Option berhasil diperbarui.');
    }

    /**
     * Delete variant option
     */
    public function destroyOption(Product $product, VariantGroup $variantGroup, VariantOption $option)
    {
        $option->delete();

        return back()->with('success', 'Option berhasil dihapus.');
    }

    /**
     * Generate all variant combinations
     */
    public function generateVariants(Product $product)
    {
        $variantGroups = $product->variantGroups()->with('activeOptions')->get();

        if ($variantGroups->isEmpty()) {
            return back()->with('error', 'Tidak ada variant groups yang tersedia.');
        }

        // Generate all combinations
        $combinations = $this->generateCombinations($variantGroups);

        $createdCount = 0;
        $skippedCount = 0;

        foreach ($combinations as $combination) {
            $hash = ProductVariant::generateCombinationHash($combination);

            // Check if variant already exists
            $existingVariant = ProductVariant::where('combination_hash', $hash)->first();

            if (!$existingVariant) {
                $sku = ProductVariant::generateSKU($product->name, $combination);
                $barcode = $this->generateBarcode();

                ProductVariant::create([
                    'product_id' => $product->id,
                    'sku' => $sku,
                    'barcode' => $barcode,
                    'price' => $product->price,
                    'cost_price' => $product->cost_price,
                    'stock' => 0,
                    'unit' => $product->unit,
                    'combination' => $combination,
                    'combination_hash' => $hash,
                    'display_order' => $product->variants()->count(),
                ]);

                $createdCount++;
            } else {
                $skippedCount++;
            }
        }

        // Update product to have variants
        $product->update(['has_variants' => true]);

        return back()->with('success', "Berhasil membuat {$createdCount} variant baru. {$skippedCount} variant sudah ada.");
    }

    /**
     * Store individual variant
     */
    public function store(Request $request, Product $product)
    {
        $validated = $request->validate([
            'sku' => 'nullable|string|max:50|unique:product_variants,sku',
            'barcode' => 'nullable|string|max:50|unique:product_variants,barcode',
            'price' => 'required|numeric|min:0',
            'cost_price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'unit' => 'required|string|max:20',
            'combination' => 'required|array',
            'is_active' => 'boolean',
        ]);

        // Generate combination hash
        $combinationHash = ProductVariant::generateCombinationHash($validated['combination']);

        // Generate SKU if not provided
        if (empty($validated['sku'])) {
            $validated['sku'] = ProductVariant::generateSKU($product->name, $validated['combination']);
        }

        // Generate barcode if not provided
        if (empty($validated['barcode'])) {
            $validated['barcode'] = $this->generateUniqueBarcode();
        }

        // Create variant
        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => $validated['sku'],
            'barcode' => $validated['barcode'],
            'price' => $validated['price'],
            'cost_price' => $validated['cost_price'],
            'stock' => $validated['stock'],
            'unit' => $validated['unit'],
            'combination' => $validated['combination'],
            'combination_hash' => $combinationHash,
            'display_order' => $product->variants()->count(),
            'is_active' => $validated['is_active'] ?? true,
        ]);

        // Update product to have variants
        $product->update(['has_variants' => true]);

        return back()->with('success', 'Variant berhasil ditambahkan.');
    }

    /**
     * Update variant
     */
    public function updateVariant(Request $request, Product $product, ProductVariant $variant)
    {
        // Dynamic validation based on what's being updated
        $rules = [];

        if ($request->has('sku')) {
            $rules['sku'] = 'required|string|max:50|unique:product_variants,sku,' . $variant->id;
        }
        if ($request->has('barcode')) {
            $rules['barcode'] = 'nullable|string|max:50|unique:product_variants,barcode,' . $variant->id;
        }
        if ($request->has('price')) {
            $rules['price'] = 'required|numeric|min:0';
        }
        if ($request->has('cost_price')) {
            $rules['cost_price'] = 'required|numeric|min:0';
        }
        if ($request->has('stock')) {
            $rules['stock'] = 'required|integer|min:0';
        }
        if ($request->has('unit')) {
            $rules['unit'] = 'required|string|max:20';
        }
        if ($request->has('is_active')) {
            $rules['is_active'] = 'boolean';
        }

        // If no specific fields, require all fields
        if (empty($rules)) {
            $rules = [
                'sku' => 'required|string|max:50|unique:product_variants,sku,' . $variant->id,
                'barcode' => 'nullable|string|max:50|unique:product_variants,barcode,' . $variant->id,
                'price' => 'required|numeric|min:0',
                'cost_price' => 'required|numeric|min:0',
                'stock' => 'required|integer|min:0',
                'unit' => 'required|string|max:20',
                'is_active' => 'boolean',
            ];
        }

        $validated = $request->validate($rules);

        $variant->update($validated);

        return back()->with('success', 'Variant berhasil diperbarui.');
    }

    /**
     * Upload variant image
     */
    public function uploadImage(Request $request, Product $product, ProductVariant $variant)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        // Remove existing image
        $variant->clearMediaCollection('variant_images');

        // Add new image
        $variant->addMediaFromRequest('image')
            ->toMediaCollection('variant_images');

        return back()->with('success', 'Gambar variant berhasil diupload.');
    }

    /**
     * Remove variant image
     */
    public function removeImage(Product $product, ProductVariant $variant)
    {
        $variant->clearMediaCollection('variant_images');

        return back()->with('success', 'Gambar variant berhasil dihapus.');
    }

    /**
     * Delete variant
     */
    public function destroyVariant(Product $product, ProductVariant $variant)
    {
        $variant->delete();

        // Check if product still has variants
        if ($product->variants()->count() === 0) {
            $product->update(['has_variants' => false]);
        }

        return back()->with('success', 'Variant berhasil dihapus.');
    }

    /**
     * Generate barcode for variant
     */
    public function generateBarcode(Product $product, ProductVariant $variant)
    {
        $barcode = $this->generateUniqueBarcode();

        $variant->update(['barcode' => $barcode]);

        return back()->with('success', 'Barcode berhasil digenerate: ' . $barcode);
    }

    /**
     * Generate barcodes for all variants
     */
    public function generateAllBarcodes(Product $product)
    {
        $variants = $product->variants()->whereNull('barcode')->get();
        $generatedCount = 0;

        foreach ($variants as $variant) {
            $barcode = $this->generateUniqueBarcode();
            $variant->update(['barcode' => $barcode]);
            $generatedCount++;
        }

        return back()->with('success', "Berhasil generate {$generatedCount} barcode baru.");
    }

    /**
     * Generate all possible combinations from variant groups
     */
    private function generateCombinations($variantGroups)
    {
        $combinations = [[]];

        foreach ($variantGroups as $group) {
            $temp = [];
            foreach ($combinations as $combination) {
                foreach ($group->activeOptions as $option) {
                    $newCombination = $combination;
                    $newCombination[$group->type] = $option->value;
                    $temp[] = $newCombination;
                }
            }
            $combinations = $temp;
        }

        return $combinations;
    }

    /**
     * Generate unique barcode
     */
    private function generateUniqueBarcode()
    {
        do {
            // Generate format: VAR + 9 digit random number
            $barcode = 'VAR' . str_pad(mt_rand(1, 999999999), 9, '0', STR_PAD_LEFT);
        } while (ProductVariant::where('barcode', $barcode)->exists());

        return $barcode;
    }

    /**
     * Export variants to Excel
     */
    public function export(Product $product)
    {
        return Excel::download(new VariantExport($product), 'variants_' . $product->sku . '_' . date('Y-m-d_H-i-s') . '.xlsx');
    }

    /**
     * Import variants from Excel
     */
    public function import(Request $request, Product $product)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240', // Max 10MB
        ]);

        try {
            $import = new VariantImport($product);
            Excel::import($import, $request->file('file'));

            $results = $import->getResults();

            $message = "Import completed: {$results['created']} created, {$results['updated']} updated";

            if (!empty($results['errors'])) {
                $message .= ". " . count($results['errors']) . " errors occurred.";
                // Log errors for debugging
                \Log::error('Variant import errors', $results['errors']);
            }

            return back()->with('success', $message);
        } catch (\Exception $e) {
            return back()->with('error', 'Import failed: ' . $e->getMessage());
        }
    }

    /**
     * Download import template
     */
    public function importTemplate(Product $product)
    {
        $filename = 'variant_import_template_' . $product->sku . '.xlsx';

        // Create a simple template with sample data
        $templateData = [
            [
                'variant_sku' => $product->sku . '-M-RED',
                'barcode' => '',
                'combination' => 'M / Red / Cotton',
                'size' => 'M',
                'color' => 'Red',
                'material' => 'Cotton',
                'price' => 75000,
                'cost_price' => 50000,
                'stock' => 10,
                'unit' => 'pcs',
                'is_active' => 'YES',
            ],
            [
                'variant_sku' => $product->sku . '-L-BLUE',
                'barcode' => '',
                'combination' => 'L / Blue / Polyester',
                'size' => 'L',
                'color' => 'Blue',
                'material' => 'Polyester',
                'price' => 85000,
                'cost_price' => 55000,
                'stock' => 15,
                'unit' => 'pcs',
                'is_active' => 'YES',
            ],
        ];

        $export = new class($templateData) implements \Maatwebsite\Excel\Concerns\FromCollection, \Maatwebsite\Excel\Concerns\WithHeadings, \Maatwebsite\Excel\Concerns\WithStyles, \Maatwebsite\Excel\Concerns\ShouldAutoSize {
            protected $data;

            public function __construct($data)
            {
                $this->data = $data;
            }

            public function collection()
            {
                return collect($this->data);
            }

            public function headings(): array
            {
                return [
                    'variant_sku',
                    'barcode',
                    'combination',
                    'size',
                    'color',
                    'material',
                    'price',
                    'cost_price',
                    'stock',
                    'unit',
                    'is_active',
                ];
            }

            public function styles(\PhpOffice\PhpSpreadsheet\Worksheet\Worksheet $sheet)
            {
                return [
                    1 => [
                        'font' => [
                            'bold' => true,
                            'color' => ['rgb' => 'FFFFFF'],
                        ],
                        'fill' => [
                            'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                            'startColor' => ['rgb' => '0F172A'],
                        ],
                        'alignment' => [
                            'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
                            'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
                        ],
                    ],
                    'A1:K1' => [
                        'borders' => [
                            'allBorders' => [
                                'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                                'color' => ['rgb' => 'CBD5E1'],
                            ],
                        ],
                    ],
                ];
            }
        };

        return Excel::download($export, $filename);
    }
}
