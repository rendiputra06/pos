<?php

namespace App\Exports;

use App\Models\Product;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ProductExport implements FromQuery, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    protected $search;
    protected $categoryId;
    protected $hasVariants;

    public function __construct($search = null, $categoryId = null, $hasVariants = null)
    {
        $this->search = $search;
        $this->categoryId = $categoryId;
        $this->hasVariants = $hasVariants;
    }

    public function query()
    {
        return Product::with('category')
            ->withCount('variants')
            ->withSum('variants as total_stock', 'stock')
            ->withMin('variants as min_price', 'price')
            ->withMax('variants as max_price', 'price')
            ->when($this->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                });
            })
            ->when($this->categoryId, function ($query, $categoryId) {
                $query->where('category_id', $categoryId);
            })
            ->when($this->hasVariants !== null && $this->hasVariants !== '', function ($query) {
                $query->where('has_variants', $this->hasVariants);
            })
            ->latest();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Nama Produk',
            'SKU',
            'Barcode',
            'Kategori',
            'Has Variants',
            'Jumlah Variants',
            'Total Stok Variant',
            'Harga Min Variant',
            'Harga Max Variant',
            'Harga Modal',
            'Harga Jual',
            'Stok',
            'Satuan',
            'Tanggal Dibuat',
        ];
    }

    public function map($product): array
    {
        return [
            $product->id,
            $product->name,
            $product->sku,
            $product->barcode ?: '-',
            $product->category->name,
            $product->has_variants ? 'YES' : 'NO',
            $product->variants_count,
            $product->has_variants ? ($product->total_stock ?? 0) : 0,
            $product->has_variants ? number_format($product->min_price ?? 0, 2, ',', '.') : '-',
            $product->has_variants ? number_format($product->max_price ?? 0, 2, ',', '.') : '-',
            number_format($product->cost_price, 2, ',', '.'),
            number_format($product->price, 2, ',', '.'),
            $product->stock,
            $product->unit,
            $product->created_at->format('d/m/Y H:i'),
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            // Style untuk heading
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF'],
                ],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '4F46E5'], // Indigo color
                ],
                'alignment' => [
                    'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
                ],
            ],
            // Auto filter
            'A1:J1' => [
                'autoFilter' => true,
            ],
        ];
    }
}
