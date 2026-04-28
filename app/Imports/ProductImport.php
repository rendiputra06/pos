<?php

namespace App\Imports;

use App\Models\Category;
use App\Models\Product;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ProductImport implements ToCollection, WithHeadingRow, WithValidation, WithBatchInserts, WithChunkReading
{
    protected $errors = [];
    protected $successCount = 0;
    protected $updatedCount = 0;
    protected $skippedCount = 0;
    protected $rowCount = 0;
    protected $processedData = [];
    protected $productsToUpdate = [];

    public function collection(Collection $rows)
    {
        $this->rowCount = $rows->count();

        foreach ($rows as $index => $row) {
            try {
                // Skip empty rows
                if (empty(array_filter($row))) {
                    continue;
                }

                // Process each row
                $processedRow = $this->processRow($row, $index + 2); // +2 for header + 1-based

                if ($processedRow) {
                    $this->processedData[] = $processedRow;
                    $this->successCount++;
                }
            } catch (\Exception $e) {
                $this->errors[] = [
                    'row' => $index + 2,
                    'error' => $e->getMessage(),
                    'data' => $row
                ];

                Log::error('Product import row error', [
                    'row' => $index + 2,
                    'error' => $e->getMessage(),
                    'data' => $row
                ]);
            }
        }

        // Batch insert successful products dalam transaction
        DB::transaction(function() {
            // Insert new products
            if (!empty($this->processedData)) {
                Product::insert($this->processedData);
            }

            // Update existing products
            foreach ($this->productsToUpdate as $updateData) {
                $updateData['product']->update($updateData['data']);
            }
        });

        return collect($this->processedData);
    }

    protected function processRow(array $row, int $rowNumber)
    {
        // Find category by name
        $categoryName = trim($row['kategori']);
        $category = Category::where('type', 'product')
            ->whereRaw('LOWER(name) = ?', [mb_strtolower($categoryName)])
            ->first();

        if (!$category) {
            throw new \Exception("Kategori '{$row['kategori']}' tidak ditemukan");
        }

        // Handle SKU - generate if empty
        $sku = !empty($row['sku']) ? trim($row['sku']) : 'PROD-' . strtoupper(Str::random(8));

        // Handle action: CREATE (default), UPDATE, SKIP
        $action = strtolower($row['action'] ?? 'create');

        // Check for existing product by SKU
        $existingProduct = null;
        if (!empty($row['sku'])) {
            $existingProduct = Product::where('sku', $sku)->first();
        }

        // Check for existing product by name in same category
        $existingByName = Product::where('name', $row['nama_produk'])
            ->where('category_id', $category->id)
            ->first();

        // Handle SKIP action
        if ($action === 'skip') {
            if ($existingProduct || $existingByName) {
                $this->skippedCount++;
                return null; // Skip this row
            }
        }

        // Handle UPDATE action
        if ($action === 'update' && $existingProduct) {
            $this->updatedCount++;
            $this->productsToUpdate[] = [
                'product' => $existingProduct,
                'data' => $this->buildProductData($row, $category->id, $sku, true)
            ];
            return null; // Will be handled in transaction
        }

        // For CREATE action: check for duplicates
        if ($action === 'create' || empty($action)) {
            if ($existingProduct) {
                throw new \Exception("SKU '{$sku}' sudah digunakan oleh produk lain. Gunakan action=UPDATE untuk memperbarui.");
            }
            if ($existingByName) {
                throw new \Exception("Produk '{$row['nama_produk']}' sudah ada dalam kategori ini.");
            }
        }

        // Clean and format data
        $costPrice = $this->cleanNumber($row['harga_modal']);
        $price = $this->cleanNumber($row['harga_jual']);
        $stock = (int) $row['stok'];

        return $this->buildProductData($row, $category->id, $sku, false);
    }

    /**
     * Build product data array for insert or update
     */
    protected function buildProductData(array $row, int $categoryId, string $sku, bool $isUpdate): array
    {
        // Clean and format data
        $costPrice = $this->cleanNumber($row['harga_modal']);
        $price = $this->cleanNumber($row['harga_jual']);
        $stock = (int) $row['stok'];

        // Handle has_variants field (optional)
        $hasVariants = 0;
        if (isset($row['has_variants'])) {
            $hasVariants = in_array(strtolower($row['has_variants']), ['yes', 'y', 'true', '1']) ? 1 : 0;
        }

        // Handle has_multiple_units field (optional)
        $hasMultipleUnits = 0;
        if (isset($row['has_multiple_units'])) {
            $hasMultipleUnits = in_array(strtolower($row['has_multiple_units']), ['yes', 'y', 'true', '1']) ? 1 : 0;
        }

        $data = [
            'category_id' => $categoryId,
            'name' => trim($row['nama_produk']),
            'sku' => $sku,
            'barcode' => !empty($row['barcode']) ? trim($row['barcode']) : null,
            'cost_price' => $costPrice,
            'price' => $price,
            'stock' => $stock,
            'unit' => !empty($row['satuan']) ? trim($row['satuan']) : 'pcs',
            'has_variants' => $hasVariants,
            'has_multiple_units' => $hasMultipleUnits,
            'description' => isset($row['deskripsi']) ? trim($row['deskripsi']) : null,
        ];

        if ($isUpdate) {
            $data['updated_at'] = now();
        } else {
            $data['created_at'] = now();
            $data['updated_at'] = now();
        }

        return $data;
    }

    public function rules(): array
    {
        return [
            'nama_produk' => 'required|string|max:255',
            'sku' => 'nullable|string|max:50',
            'barcode' => 'nullable|string|max:50',
            'kategori' => [
                'required',
                'string',
                Rule::exists('categories', 'name')->where(function ($query) {
                    $query->where('type', 'product');
                })
            ],
            'action' => 'nullable|string|in:create,update,skip,CREATE,UPDATE,SKIP',
            'has_multiple_units' => 'nullable|string|in:yes,no,y,n,true,false,1,0,YES,NO,Y,N,TRUE,FALSE',
            'harga_modal' => 'required|numeric|min:0',
            'harga_jual' => 'required|numeric|min:0',
            'stok' => 'required|integer|min:0',
            'satuan' => 'required|string|max:20',
            'has_variants' => 'nullable|string|in:yes,no,y,n,true,false,1,0,YES,NO,Y,N,TRUE,FALSE',
            'deskripsi' => 'nullable|string|max:1000',
        ];
    }

    public function customValidationMessages()
    {
        return [
            'nama_produk.required' => 'Nama produk wajib diisi',
            'kategori.required' => 'Kategori wajib diisi',
            'kategori.exists' => 'Kategori tidak ditemukan',
            'harga_modal.required' => 'Harga modal wajib diisi',
            'harga_modal.numeric' => 'Harga modal harus berupa angka',
            'harga_jual.required' => 'Harga jual wajib diisi',
            'harga_jual.numeric' => 'Harga jual harus berupa angka',
            'stok.required' => 'Stok wajib diisi',
            'stok.integer' => 'Stok harus berupa angka bulat',
            'satuan.required' => 'Satuan wajib diisi',
            'has_variants.in' => 'Has variants harus YES/NO/Y/N/TRUE/FALSE/1/0',
            'action.in' => 'Action harus CREATE/UPDATE/SKIP',
            'has_multiple_units.in' => 'Has multiple units harus YES/NO/Y/N/TRUE/FALSE/1/0',
            'kategori.exists' => 'Kategori tidak ditemukan atau bukan kategori produk',
        ];
    }

    public function batchSize(): int
    {
        return 100;
    }

    public function chunkSize(): int
    {
        return 100;
    }

    public function getErrors()
    {
        return $this->errors;
    }

    public function getSuccessCount()
    {
        return $this->successCount;
    }

    public function getRowCount()
    {
        return $this->rowCount;
    }

    public function getProcessedCount()
    {
        return count($this->processedData);
    }

    public function getUpdatedCount()
    {
        return $this->updatedCount;
    }

    public function getSkippedCount()
    {
        return $this->skippedCount;
    }

    private function cleanNumber($value)
    {
        if ($value === null || $value === '') {
            return 0;
        }

        $value = (string) $value;
        $value = preg_replace('/[^0-9,.-]/', '', $value);

        $hasComma = strpos($value, ',') !== false;
        $hasDot = strpos($value, '.') !== false;

        if ($hasComma && $hasDot) {
            // European style: thousand separator is dot, decimal separator is comma
            $value = str_replace('.', '', $value);
            $value = str_replace(',', '.', $value);
        } elseif ($hasComma && !$hasDot) {
            // Comma decimal separator
            $value = str_replace(',', '.', $value);
        }

        return (float) $value;
    }
}
