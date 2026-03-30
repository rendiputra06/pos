import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { Calendar, Download, Filter, Search, Store } from 'lucide-react';
import { useState } from 'react';

interface Transaction {
    id: number;
    invoice_number: string;
    created_at: string;
    grand_total: number;
    payment_method: string;
    user: { name: string };
    details: Array<{ qty: number; price: number; subtotal: number }>;
}

interface SalesReportProps {
    transactions: {
        data: Transaction[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        start_date?: string;
        end_date?: string;
        user_id?: string;
        store_id?: string;
    };
    stores?: Array<{ id: number; name: string }>;
}

export default function SalesReport({ transactions, filters, stores = [] }: SalesReportProps) {
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [storeId, setStoreId] = useState(filters.store_id || 'all');

    const handleFilter = () => {
        router.get(route('reports.sales'), {
            start_date: startDate,
            end_date: endDate,
            store_id: storeId === 'all' ? undefined : storeId,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setStartDate('');
        setEndDate('');
        setStoreId('all');
        router.get(route('reports.sales'));
    };

    const handleExport = () => {
        window.location.href = route('reports.export.sales', {
            start_date: startDate,
            end_date: endDate,
        });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getPaymentMethodBadge = (method: string) => {
        const variants: Record<string, any> = {
            cash: 'default',
            qris: 'secondary',
            bank_transfer: 'outline',
        };
        return variants[method] || 'default';
    };

    const totalSales = transactions.data.reduce((sum, t) => sum + t.grand_total, 0);

    return (
        <AppLayout breadcrumbs={[
            { title: 'Reports', href: '#' },
            { title: 'Sales Report', href: '/reports/sales' },
        ]}>
            <Head title="Laporan Penjualan" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Laporan Penjualan</h1>
                    <p className="text-muted-foreground">Detail transaksi penjualan dengan filter tanggal</p>
                </div>

                {/* Filter Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="w-5 h-5" />
                            Filter Laporan
                        </CardTitle>
                        <CardDescription>Pilih rentang tanggal untuk melihat laporan</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="start_date">Tanggal Mulai</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end_date">Tanggal Akhir</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                            {stores.length > 0 && (
                                <div className="space-y-2">
                                    <Label htmlFor="store_id">Toko</Label>
                                    <Select value={storeId} onValueChange={setStoreId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Semua Toko" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Toko</SelectItem>
                                            {stores.map(s => (
                                                <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <div className="flex items-end gap-2">
                                <Button onClick={handleFilter} className="flex-1">
                                    <Search className="w-4 h-4 mr-2" />
                                    Terapkan
                                </Button>
                                <Button onClick={handleReset} variant="outline">
                                    Reset
                                </Button>
                            </div>
                            <div className="flex items-end">
                                <Button onClick={handleExport} variant="secondary" className="w-full">
                                    <Download className="w-4 h-4 mr-2" />
                                    Export Excel
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total Transaksi</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{transactions.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total Penjualan</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(totalSales)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Rata-rata per Transaksi</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(transactions.total > 0 ? totalSales / transactions.total : 0)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Transactions Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Detail Transaksi</CardTitle>
                        <CardDescription>
                            Menampilkan {transactions.data.length} dari {transactions.total} transaksi
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Invoice</TableHead>
                                        <TableHead>Tanggal & Waktu</TableHead>
                                        <TableHead>Kasir</TableHead>
                                        <TableHead>Metode Bayar</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                Tidak ada transaksi ditemukan
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        transactions.data.map((transaction) => (
                                            <TableRow key={transaction.id}>
                                                <TableCell className="font-medium">
                                                    {transaction.invoice_number}
                                                </TableCell>
                                                <TableCell>{formatDate(transaction.created_at)}</TableCell>
                                                <TableCell>{transaction.user.name}</TableCell>
                                                <TableCell>
                                                    <Badge variant={getPaymentMethodBadge(transaction.payment_method)}>
                                                        {transaction.payment_method.toUpperCase()}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-emerald-600">
                                                    {formatCurrency(transaction.grand_total)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {transactions.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <p className="text-sm text-muted-foreground">
                                    Halaman {transactions.current_page} dari {transactions.last_page}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={transactions.current_page === 1}
                                        onClick={() => router.get(route('reports.sales', {
                                            ...filters,
                                            page: transactions.current_page - 1
                                        }))}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={transactions.current_page === transactions.last_page}
                                        onClick={() => router.get(route('reports.sales', {
                                            ...filters,
                                            page: transactions.current_page + 1
                                        }))}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
