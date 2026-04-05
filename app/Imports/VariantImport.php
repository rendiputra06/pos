<?php

namespace App\Imports;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\VariantGroup;
use App\Models\VariantOption;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class VariantImport implements ToCollection, WithHeadingRow, WithValidation, WithBatchInserts, WithChunkReading
{
    protected $product;
    protected $results = [
        'created' => 0,
        'updated' => 0,
        'skipped' => 0,
        'errors' => [],
    ];

    public function __construct(Product $product)
    {
        $this->product = $product;
    }

    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            try {
                $this->processRow($row);
            } catch (\Exception $e) {
                $this->results['errors'][] = "Row error: " . $e->getMessage() . " (Data: " . json_encode($row) . ")";
                Log::error('Variant import error', [
                    'error' => $e->getMessage(),
                    'row' => $row,
                ]);
            }
        }
    }

    protected function processRow($row)
    {
        // Skip if variant_sku is empty
        if (empty($row['variant_sku'])) {
            $this->results['skipped']++;
            return;
        }

        // Parse combination
        $combination = $this->parseCombination($row);

        // Generate combination hash
        $combinationHash = md5(json_encode($combination));

        // Check if variant exists
        $existingVariant = ProductVariant::where('product_id', $this->product->id)
            ->where('combination_hash', $combinationHash)
            ->first();

        if ($existingVariant) {
            // Update existing variant
            $existingVariant->update([
                'sku' => $row['variant_sku'],
                'barcode' => $row['barcode'] ?? null,
                'price' => $row['price'] ?? 0,
                'cost_price' => $row['cost_price'] ?? 0,
                'stock' => $row['stock'] ?? 0,
                'unit' => $row['unit'] ?? 'pcs',
                'is_active' => $this->parseBoolean($row['is_active'] ?? 'YES'),
            ]);

            $this->results['updated']++;
        } else {
            // Create new variant
            ProductVariant::create([
                'product_id' => $this->product->id,
                'sku' => $row['variant_sku'],
                'barcode' => $row['barcode'] ?? $this->generateUniqueBarcode(),
                'price' => $row['price'] ?? 0,
                'cost_price' => $row['cost_price'] ?? 0,
                'stock' => $row['stock'] ?? 0,
                'unit' => $row['unit'] ?? 'pcs',
                'combination' => $combination,
                'combination_hash' => $combinationHash,
                'is_active' => $this->parseBoolean($row['is_active'] ?? 'YES'),
            ]);

            $this->results['created']++;
        }

        // Update product to have variants
        $this->product->update(['has_variants' => true]);
    }

    protected function parseCombination($row)
    {
        $combination = [];

        // Parse individual variant attributes
        if (!empty($row['size'])) {
            $combination['size'] = $row['size'];
        }

        if (!empty($row['color'])) {
            $combination['color'] = $row['color'];
        }

        if (!empty($row['material'])) {
            $combination['material'] = $row['material'];
        }

        // If combination is empty but combination_string exists, parse it
        if (empty($combination) && !empty($row['combination'])) {
            $parts = explode('/', $row['combination']);
            $variantTypes = ['size', 'color', 'material'];
            
            foreach ($parts as $index => $part) {
                if (isset($variantTypes[$index])) {
                    $combination[$variantTypes[$index]] = trim($part);
                }
            }
        }

        return $combination;
    }

    protected function parseBoolean($value)
    {
        return in_array(strtoupper($value), ['YES', 'Y', 'TRUE', '1', 'ACTIVE']);
    }

    protected function generateUniqueBarcode()
    {
        do {
            $barcode = 'VAR' . str_pad(mt_rand(1, 999999999), 9, '0', STR_PAD_LEFT);
        } while (ProductVariant::where('barcode', $barcode)->exists());
        
        return $barcode;
    }

    public function rules(): array
    {
        return [
            'variant_sku' => 'required|string|max:50',
            'barcode' => 'nullable|string|max:50',
            'price' => 'required|numeric|min:0',
            'cost_price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'unit' => 'required|string|max:20',
            'is_active' => 'nullable|string|in:YES,NO,Y,N,TRUE,FALSE,1,0,ACTIVE,INACTIVE',
            'size' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:50',
            'material' => 'nullable|string|max:50',
        ];
    }

    public function batchSize(): int
    {
        return 50;
    }

    public function chunkSize(): int
    {
        return 50;
    }

    public function getResults()
    {
        return $this->results;
    }
}
