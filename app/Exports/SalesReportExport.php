<?php

namespace App\Exports;

use App\Models\Transaction;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class SalesReportExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    protected $startDate;
    protected $endDate;

    public function __construct($startDate = null, $endDate = null)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
    }

    public function collection()
    {
        $query = Transaction::with(['user'])
            ->where('status', 'success')
            ->orderByDesc('created_at');

        if ($this->startDate) {
            $query->whereDate('created_at', '>=', $this->startDate);
        }
        if ($this->endDate) {
            $query->whereDate('created_at', '<=', $this->endDate);
        }

        return $query->get();
    }

    public function headings(): array
    {
        return [
            'Invoice Number',
            'Tanggal',
            'Waktu',
            'Kasir',
            'Total',
            'Metode Pembayaran',
            'Status',
        ];
    }

    public function map($transaction): array
    {
        return [
            $transaction->invoice_number,
            $transaction->created_at->format('Y-m-d'),
            $transaction->created_at->format('H:i:s'),
            $transaction->user->name,
            $transaction->grand_total,
            strtoupper($transaction->payment_method),
            ucfirst($transaction->status),
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
