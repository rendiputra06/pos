<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Exports\ProductExport;
use App\Imports\ProductImport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::with('category', 'media', 'primaryVariant.media')
            ->withCount('variants')
            ->withCount(['variants as active_variants_count' => function ($query) {
                $query->where('is_active', true);
            }])
            ->withCount(['variantsWithImages as variant_images_count'])
            ->withSum('variants as total_stock', 'stock')
            ->withMin('variants as min_price', 'price')
            ->withMax('variants as max_price', 'price')
            ->withAvg('variants as average_price', 'price')
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                });
            })
            ->when($request->category_id, function ($query, $categoryId) {
                $query->where('category_id', $categoryId);
            })
            ->when($request->has_variants !== null && $request->has_variants !== '', function ($query) use ($request) {
                $query->where('has_variants', $request->has_variants);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('products/Index', [
            'products' => $products,
            'categories' => Category::where('type', 'product')->get(),
            'filters' => $request->only(['search', 'category_id', 'has_variants']),
        ]);
    }

    public function create()
    {
        return Inertia::render('products/Form', [
            'categories' => Category::where('type', 'product')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $rules = [
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:50|unique:products,sku',
            'barcode' => 'nullable|string|max:50',
            'unit' => 'required|string|max:20',
            'has_variants' => 'boolean',
            'image' => 'nullable|image|mimes:jpeg,png,webp|max:2048',
        ];

        // Conditional validation based on has_variants
        if (!$request->boolean('has_variants')) {
            $rules['cost_price'] = 'required|numeric|min:0';
            $rules['price'] = 'required|numeric|min:0';
            $rules['stock'] = 'required|integer|min:0';
        }

        $validated = $request->validate($rules);

        if (empty($validated['sku'])) {
            $validated['sku'] = 'PROD-' . strtoupper(Str::random(8));
        }

        $product = Product::create($validated);

        // Handle image upload
        if ($request->hasFile('image')) {
            $product->addMediaFromRequest('image')
                ->toMediaCollection('product_images');
        }

        // Check if this is a "save and input variants" request
        if ($request->get('redirect_to_variants')) {
            $product->load(['category', 'media', 'variants', 'variantGroups']);

            return Inertia::render('products/variants/Index', [
                'product' => $product,
                'variantGroups' => $product->variantGroups,
                'variants' => $product->variants,
            ])->with('success', 'Produk berhasil dibuat. Sekarang Anda dapat menambahkan varian.');
        }

        return redirect()->route('products.index')->with('success', 'Produk berhasil dibuat.');
    }

    public function edit(Product $product)
    {
        return Inertia::render('products/Form', [
            'product' => $product,
            'categories' => Category::where('type', 'product')->get(),
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $rules = [
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:50|unique:products,sku,' . $product->id,
            'barcode' => 'nullable|string|max:50',
            'unit' => 'required|string|max:20',
            'has_variants' => 'boolean',
            'image' => 'nullable|image|mimes:jpeg,png,webp|max:2048',
        ];

        // Conditional validation based on has_variants
        if (!$request->boolean('has_variants')) {
            $rules['cost_price'] = 'required|numeric|min:0';
            $rules['price'] = 'required|numeric|min:0';
            $rules['stock'] = 'required|integer|min:0';
        }

        $validated = $request->validate($rules);

        // Set default values for variant products
        if ($request->boolean('has_variants')) {
            $validated['cost_price'] = $validated['cost_price'] ?? $product->cost_price;
            $validated['price'] = $validated['price'] ?? $product->price;
            $validated['stock'] = 0; // Always 0 for variant products
        }

        $product->update($validated);

        // Handle has_variants toggle logic
        if (isset($validated['has_variants'])) {
            $newVariantStatus = $validated['has_variants'];
            $oldVariantStatus = $product->getOriginal('has_variants');

            // If switching from variants to simple product
            if ($oldVariantStatus && !$newVariantStatus) {
                // Delete all variant data
                $product->variantGroups()->delete();
                $product->variants()->delete();

                // Reset stock to 0 since variants had their own stock
                $product->update(['stock' => 0]);
            }

            // If switching from simple to variants
            if (!$oldVariantStatus && $newVariantStatus) {
                // Clear existing stock since variants will manage their own
                $product->update(['stock' => 0]);
            }
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            // Remove existing image
            $product->clearMediaCollection('product_images');

            // Add new image
            $product->addMediaFromRequest('image')
                ->toMediaCollection('product_images');
        }

        return redirect()->route('products.index')->with('success', 'Produk berhasil diperbarui.');
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return redirect()->route('products.index')->with('success', 'Produk berhasil dihapus.');
    }

    public function barcode(Product $product, Request $request)
    {
        $variantId = $request->get('variant');

        if ($variantId) {
            $variant = $product->variants()->findOrFail($variantId);
            $variant->load('media'); // Load variant images

            return Inertia::render('products/Barcode', [
                'product' => $product,
                'variant' => $variant,
            ]);
        }

        $product->load('media'); // Load product images

        return Inertia::render('products/Barcode', [
            'product' => $product,
        ]);
    }

    public function removeImage(Product $product)
    {
        $product->clearMediaCollection('product_images');

        return back()->with('success', 'Gambar produk berhasil dihapus.');
    }

    public function export(Request $request)
    {
        $search = $request->get('search');
        $categoryId = $request->get('category_id');
        $hasVariants = $request->get('has_variants');

        $filename = 'produk_' . date('Y-m-d_H-i-s') . '.xlsx';

        return Excel::download(new ProductExport($search, $categoryId, $hasVariants), $filename);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240', // Max 10MB
        ]);

        try {
            $import = new ProductImport();
            Excel::import($import, $request->file('file'));

            $errors = $import->getErrors();
            $successCount = $import->getSuccessCount();
            $processedCount = $import->getProcessedCount();
            $rowCount = $import->getRowCount();

            // Log import summary
            \Log::info('Product import completed', [
                'total_rows' => $rowCount,
                'processed' => $processedCount,
                'success' => $successCount,
                'errors' => count($errors)
            ]);

            if (empty($errors) && $successCount > 0) {
                return back()->with('success', "✅ Berhasil mengimport {$successCount} produk dari {$rowCount} baris!");
            } elseif ($successCount > 0) {
                $message = "⚠️ Berhasil mengimport {$successCount} dari {$rowCount} produk. " . count($errors) . " produk gagal.";

                return back()
                    ->with('warning', $message)
                    ->with('import_errors', $errors)
                    ->with('import_stats', [
                        'total' => $rowCount,
                        'processed' => $processedCount,
                        'success' => $successCount,
                        'errors' => count($errors)
                    ]);
            } else {
                return back()
                    ->with('error', "❌ Semua {$rowCount} produk gagal diimport. Periksa format file dan data Anda.")
                    ->with('import_errors', $errors);
            }
        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            $failures = $e->failures();
            $errorMessages = [];

            foreach ($failures as $failure) {
                $row = $failure->row();
                $errors = $failure->errors();
                $errorMessages[] = [
                    'row' => $row,
                    'error' => implode(', ', $errors),
                    'data' => $failure->attributes()
                ];
            }

            return back()
                ->with('error', '❌ Validasi file gagal. ' . count($errorMessages) . ' baris memiliki error.')
                ->with('import_errors', $errorMessages);
        } catch (\Exception $e) {
            \Log::error('Product import error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', '❌ Terjadi kesalahan saat mengimport file: ' . $e->getMessage());
        }
    }

    public function importTemplate()
    {
        $filename = 'template_import_produk_' . date('Y-m-d') . '.xlsx';

        // Create a simple array for template with enhanced structure
        $templateData = collect([
            [
                'nama_produk' => 'Contoh: Buku Sidu 38 Lembar',
                'sku' => 'PROD-EXAMPLE',
                'barcode' => '1234567890123',
                'kategori' => 'Alat Tulis',
                'harga_modal' => 5000,
                'harga_jual' => 7500,
                'stok' => 50,
                'satuan' => 'pcs',
                'has_variants' => 'NO',
                'deskripsi' => 'Buku tulis 38 lembar berkualitas tinggi',
            ],
            [
                'nama_produk' => 'Contoh: Pulpen Pilot V5',
                'sku' => 'PROD-PEN-001',
                'barcode' => '9876543210987',
                'kategori' => 'Alat Tulis',
                'harga_modal' => 8000,
                'harga_jual' => 12000,
                'stok' => 100,
                'satuan' => 'pcs',
                'has_variants' => 'YES',
                'deskripsi' => 'Pulpen smooth dengan tinta berkualitas',
            ],
        ]);

        return Excel::download(new class($templateData) implements \Maatwebsite\Excel\Concerns\FromCollection, \Maatwebsite\Excel\Concerns\WithHeadings, \Maatwebsite\Excel\Concerns\WithStyles, \Maatwebsite\Excel\Concerns\ShouldAutoSize {
            private $data;

            public function __construct($data)
            {
                $this->data = $data;
            }

            public function collection()
            {
                return $this->data;
            }

            public function headings(): array
            {
                return [
                    'nama_produk',
                    'sku',
                    'barcode',
                    'kategori',
                    'harga_modal',
                    'harga_jual',
                    'stok',
                    'satuan',
                    'has_variants',
                    'deskripsi',
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
                            'startColor' => ['rgb' => '4F46E5'],
                        ],
                        'alignment' => [
                            'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
                            'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
                        ],
                    ],
                    'A1:J1' => [
                        'borders' => [
                            'allBorders' => [
                                'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                                'color' => ['rgb' => 'E5E7EB'],
                            ],
                        ],
                    ],
                ];
            }
        }, $filename);
    }
}
