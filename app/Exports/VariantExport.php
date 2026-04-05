<?php

namespace App\Exports;

use App\Models\Product;
use App\Models\ProductVariant;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class VariantExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $product;

    public function __construct(Product $product)
    {
        $this->product = $product;
    }

    public function collection()
    {
        return $this->product->variants()->with('media')->get();
    }

    public function headings(): array
    {
        return [
            'PRODUCT_NAME',
            'PRODUCT_SKU',
            'VARIANT_SKU',
            'BARCODE',
            'COMBINATION',
            'SIZE',
            'COLOR',
            'MATERIAL',
            'PRICE',
            'COST_PRICE',
            'STOCK',
            'UNIT',
            'IS_ACTIVE',
            'HAS_IMAGE',
            'CREATED_AT',
            'UPDATED_AT',
        ];
    }

    public function map($variant): array
    {
        $combination = $variant->combination ?? [];
        
        return [
            $this->product->name,
            $this->product->sku,
            $variant->sku,
            $variant->barcode,
            $variant->formatted_combination,
            $combination['size'] ?? '',
            $combination['color'] ?? '',
            $combination['material'] ?? '',
            $variant->price,
            $variant->cost_price,
            $variant->stock,
            $variant->unit,
            $variant->is_active ? 'YES' : 'NO',
            $variant->hasMedia('variant_images') ? 'YES' : 'NO',
            $variant->created_at->format('Y-m-d H:i:s'),
            $variant->updated_at->format('Y-m-d H:i:s'),
        ];
    }

    public function styles(Worksheet $sheet)
    {
        // Style header row
        $sheet->getStyle('A1:Q1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
            ],
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => '4F46E5'],
            ],
        ]);

        // Auto-size columns
        foreach (range('A', 'Q') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

        // Style data rows
        $sheet->getStyle('A2:Q' . ($sheet->getHighestRow()))->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                    'color' => ['rgb' => 'E5E7EB'],
                ],
            ],
        ]);

        // Center align specific columns
        $sheet->getStyle('I:K')->getAlignment()->setHorizontal('center');
        $sheet->getStyle('M:N')->getAlignment()->setHorizontal('center');

        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
