import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Head } from '@inertiajs/react';
import { Store, Printer } from 'lucide-react';
import { useEffect } from 'react';

interface TransactionItem {
    name: string;
    qty: number;
    price: number;
    subtotal: number;
}

interface ReceiptProps {
    transaction: {
        invoice_number: string;
        created_at: string;
        total_amount: number;
        grand_total: number;
        payment_method: string;
        user: { name: string };
        details: TransactionItem[];
        store: {
            name: string;
            address: string | null;
            phone: string | null;
            receipt_header: string | null;
            receipt_footer: string | null;
        } | null;
    };
}

export default function Receipt({ transaction }: ReceiptProps) {
    useEffect(() => {
        // Auto print when opened
        setTimeout(() => window.print(), 500);
    }, []);

    const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
    const formatDate = (date: string) => new Date(date).toLocaleString('id-ID');

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <Head title={`Struk #${transaction.invoice_number}`} />

            <div className="bg-white w-[80mm] min-h-[100mm] shadow-lg p-4 font-mono text-xs leading-relaxed relative print:shadow-none print:w-full">
                <div className="text-center mb-4">
                    <div className="flex justify-center mb-2">
                        <Store className="w-8 h-8" />
                    </div>
                    <h1 className="font-bold text-base uppercase">{transaction.store?.name || 'Smart POS'}</h1>
                    {transaction.store?.address && <p>{transaction.store.address}</p>}
                    {transaction.store?.phone && <p>Telp: {transaction.store.phone}</p>}
                    
                    {transaction.store?.receipt_header && (
                        <div className="mt-2 whitespace-pre-wrap">
                            {transaction.store.receipt_header}
                        </div>
                    )}
                </div>

                <Separator className="my-2 border-dashed" />

                <div className="flex justify-between">
                    <span>No: {transaction.invoice_number}</span>
                    <span>{formatDate(transaction.created_at)}</span>
                </div>
                <div>Kasir: {transaction.user.name}</div>

                <Separator className="my-2 border-dashed" />

                <div className="space-y-2">
                    {transaction.details.map((item, idx) => (
                        <div key={idx} className="flex flex-col">
                            <span className="font-bold">{item.name}</span>
                            <div className="flex justify-between">
                                <span>{item.qty} x {formatCurrency(item.price)}</span>
                                <span>{formatCurrency(item.subtotal)}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <Separator className="my-2 border-dashed" />

                <div className="space-y-1">
                    <div className="flex justify-between font-bold text-sm">
                        <span>TOTAL</span>
                        <span>{formatCurrency(transaction.grand_total)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Bayar ({transaction.payment_method.toUpperCase()})</span>
                        <span>{formatCurrency(transaction.grand_total)}</span>
                    </div>
                </div>

                <Separator className="my-2 border-dashed" />

                <div className="text-center text-[10px] mt-4 whitespace-pre-wrap">
                    {transaction.store?.receipt_footer ? (
                        transaction.store.receipt_footer
                    ) : (
                        <>
                            <p>Terima kasih atas kunjungan Anda</p>
                            <p>Barang yang sudah dibeli tidak dapat ditukar kecuali ada perjanjian.</p>
                        </>
                    )}
                </div>

                <style>{`
                    @media print {
                        body { background: white; }
                        @page { margin: 0; size: 80mm auto; }
                        .no-print { display: none; }
                    }
                `}</style>

                <div className="mt-8 no-print flex justify-center gap-2">
                    <Button size="sm" onClick={() => window.print()}>
                        <Printer className="w-4 h-4 mr-2" /> Cetak
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => window.close()}>
                        Tutup
                    </Button>
                </div>
            </div>
        </div>
    );
}
