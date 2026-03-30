import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem } from '@/types';
import { ChevronLeft, ArrowRight, Package, Send, CheckCircle, XCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface TransferDetail {
    id: number;
    product_bank: { name: string; sku: string };
    qty: number;
}

interface Transfer {
    id: number;
    reference_number: string;
    from_store: { name: string; address: string };
    to_store: { name: string; address: string };
    status: 'pending' | 'shipped' | 'received' | 'cancelled';
    notes: string | null;
    created_at: string;
    shipped_at: string | null;
    received_at: string | null;
    user: { name: string };
    details: TransferDetail[];
}

interface Props {
    transfer: Transfer;
}

export default function StockTransferShow({ transfer }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Mutasi Stok', href: '/stock-transfers' },
        { title: 'Detail Mutasi', href: '#' },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 uppercase px-3 py-1">Pending</Badge>;
            case 'shipped': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 uppercase px-3 py-1">Dalam Pengiriman</Badge>;
            case 'received': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 uppercase px-3 py-1">Diterima</Badge>;
            case 'cancelled': return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 uppercase px-3 py-1">Dibatalkan</Badge>;
            default: return <Badge className="uppercase px-3 py-1">{status}</Badge>;
        }
    };

    const updateStatus = (newStatus: string) => {
        if (!confirm(`Apakah Anda yakin ingin mengubah status menjadi ${newStatus}?`)) return;
        
        router.patch(`/stock-transfers/${transfer.id}/status`, { status: newStatus });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Mutasi ${transfer.reference_number}`} />
            
            <div className="p-6 max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <Link href="/stock-transfers">
                            <Button variant="outline" size="icon">
                                <ChevronLeft className="size-4" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tight">{transfer.reference_number}</h1>
                                {getStatusBadge(transfer.status)}
                            </div>
                            <p className="text-muted-foreground mt-1">
                                Dibuat oleh {transfer.user.name} pada {new Date(transfer.created_at).toLocaleString('id-ID')}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        {transfer.status === 'pending' && (
                            <>
                                <Button 
                                    variant="outline" 
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => updateStatus('cancelled')}
                                >
                                    <XCircle className="size-4 mr-2" /> Batalkan
                                </Button>
                                <Button 
                                    onClick={() => updateStatus('shipped')}
                                >
                                    <Send className="size-4 mr-2" /> Kirim Barang
                                </Button>
                            </>
                        )}
                        
                        {transfer.status === 'shipped' && (
                            <Button 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => updateStatus('received')}
                            >
                                <CheckCircle className="size-4 mr-2" /> Konfirmasi Diterima
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Toko Asal</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-bold text-lg">{transfer.from_store.name}</p>
                            <p className="text-sm text-muted-foreground mt-1">{transfer.from_store.address}</p>
                        </CardContent>
                    </Card>
                    <div className="flex items-center justify-center">
                        <ArrowRight className="size-8 text-primary/30" />
                    </div>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Toko Tujuan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-bold text-lg">{transfer.to_store.name}</p>
                            <p className="text-sm text-muted-foreground mt-1">{transfer.to_store.address}</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="size-5 text-primary" /> Rincian Barang
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Produk</TableHead>
                                            <TableHead>SKU</TableHead>
                                            <TableHead className="text-right">Jumlah</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transfer.details.map((detail) => (
                                            <TableRow key={detail.id}>
                                                <TableCell className="font-medium">{detail.product_bank.name}</TableCell>
                                                <TableCell className="text-xs text-muted-foreground font-mono">{detail.product_bank.sku}</TableCell>
                                                <TableCell className="text-right font-bold">{detail.qty}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Informasi Mutasi</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-xs text-muted-foreground uppercase tracking-tight">Status Saat Ini</Label>
                                    <div className="mt-1">{getStatusBadge(transfer.status)}</div>
                                </div>
                                <Separator />
                                <div>
                                    <Label className="text-xs text-muted-foreground uppercase tracking-tight">Timeline</Label>
                                    <div className="mt-2 space-y-3">
                                        <div className="flex items-start gap-2">
                                            <div className="size-2 rounded-full bg-primary mt-1.5" />
                                            <div>
                                                <p className="text-xs font-bold">Dibuat</p>
                                                <p className="text-[10px] text-muted-foreground">{new Date(transfer.created_at).toLocaleString('id-ID')}</p>
                                            </div>
                                        </div>
                                        {transfer.shipped_at && (
                                            <div className="flex items-start gap-2">
                                                <div className="size-2 rounded-full bg-blue-500 mt-1.5" />
                                                <div>
                                                    <p className="text-xs font-bold">Dikirim</p>
                                                    <p className="text-[10px] text-muted-foreground">{new Date(transfer.shipped_at).toLocaleString('id-ID')}</p>
                                                </div>
                                            </div>
                                        )}
                                        {transfer.received_at && (
                                            <div className="flex items-start gap-2">
                                                <div className="size-2 rounded-full bg-green-500 mt-1.5" />
                                                <div>
                                                    <p className="text-xs font-bold">Diterima</p>
                                                    <p className="text-[10px] text-muted-foreground">{new Date(transfer.received_at).toLocaleString('id-ID')}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Keterangan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground italic">
                                    {transfer.notes || 'Tidak ada catatan tambahan.'}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
