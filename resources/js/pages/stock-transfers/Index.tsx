import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem } from '@/types';
import { MoveHorizontal, Plus, Search, Eye, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Transfer {
    id: number;
    reference_number: string;
    from_store: { name: string };
    to_store: { name: string };
    status: 'pending' | 'shipped' | 'received' | 'cancelled';
    created_at: string;
    user: { name: string };
}

interface Props {
    transfers: {
        data: Transfer[];
        links: any[];
    };
}

export default function StockTransferIndex({ transfers }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Mutasi Stok', href: '/stock-transfers' },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 uppercase text-[10px]">Pending</Badge>;
            case 'shipped': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 uppercase text-[10px]">Dikirim</Badge>;
            case 'received': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 uppercase text-[10px]">Diterima</Badge>;
            case 'cancelled': return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 uppercase text-[10px]">Dibatalkan</Badge>;
            default: return <Badge variant="outline" className="uppercase text-[10px]">{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mutasi Stok Antar Toko" />
            
            <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Mutasi Stok</h1>
                        <p className="text-muted-foreground mt-1">Kelola pemindahan barang antar cabang toko.</p>
                    </div>
                    <Link href="/stock-transfers/create">
                        <Button className="gap-2">
                            <Plus className="size-4" /> Tambah Mutasi
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Search className="size-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Cari nomor referensi..." 
                                    className="w-[300px]"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>No. Referensi</TableHead>
                                    <TableHead>Dari Toko</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                    <TableHead>Ke Toko</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transfers.data.length > 0 ? (
                                    transfers.data.map((transfer) => (
                                        <TableRow key={transfer.id}>
                                            <TableCell className="font-medium">{transfer.reference_number}</TableCell>
                                            <TableCell>{transfer.from_store.name}</TableCell>
                                            <TableCell>
                                                <ArrowRight className="size-4 text-muted-foreground" />
                                            </TableCell>
                                            <TableCell>{transfer.to_store.name}</TableCell>
                                            <TableCell>{getStatusBadge(transfer.status)}</TableCell>
                                            <TableCell>{new Date(transfer.created_at).toLocaleDateString('id-ID')}</TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/stock-transfers/${transfer.id}`}>
                                                    <Button variant="ghost" size="sm" className="gap-2">
                                                        <Eye className="size-4" /> Lihat
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                            Belum ada data mutasi stok.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
