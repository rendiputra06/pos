import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type BreadcrumbItem } from '@/types';
import { ChevronLeft, Plus, Save, Trash2, Search } from 'lucide-react';

interface Store {
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
    sku: string;
}

interface Props {
    stores: Store[];
    products: Product[];
}

export default function StockTransferForm({ stores, products }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        from_store_id: '',
        to_store_id: '',
        notes: '',
        items: [] as { product_bank_id: string; product_name: string; sku: string; qty: number }[],
    });

    const [searchTerm, setSearchTerm] = useState('');
    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Mutasi Stok', href: '/stock-transfers' },
        { title: 'Tambah Mutasi', href: '#' },
    ];

    const addItem = (product: Product) => {
        if (data.items.find(item => item.product_bank_id === product.id.toString())) return;
        
        setData('items', [
            ...data.items,
            { product_bank_id: product.id.toString(), product_name: product.name, sku: product.sku, qty: 1 }
        ]);
        setSearchTerm('');
    };

    const removeItem = (index: number) => {
        const newItems = [...data.items];
        newItems.splice(index, 1);
        setData('items', newItems);
    };

    const updateItemQty = (index: number, qty: number) => {
        const newItems = [...data.items];
        newItems[index].qty = qty;
        setData('items', newItems);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/stock-transfers');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Mutasi Stok" />
            <div className="p-6 max-w-5xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/stock-transfers">
                        <Button variant="outline" size="icon">
                            <ChevronLeft className="size-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Buat Mutasi Stok</h1>
                        <p className="text-muted-foreground mt-1">Pindahkan barang antar cabang toko secara resmi.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Konfigurasi Toko</CardTitle>
                                    <CardDescription>Tentukan asal dan tujuan pengiriman.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label>Dari Toko (Pengirim) <span className="text-destructive">*</span></Label>
                                        <Select value={data.from_store_id} onValueChange={(val) => setData('from_store_id', val)}>
                                            <SelectTrigger className={errors.from_store_id ? 'border-destructive' : ''}>
                                                <SelectValue placeholder="Pilih Toko Asal" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {stores.map(store => (
                                                    <SelectItem key={store.id} value={store.id.toString()}>{store.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.from_store_id && <p className="text-xs text-destructive">{errors.from_store_id}</p>}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Ke Toko (Penerima) <span className="text-destructive">*</span></Label>
                                        <Select value={data.to_store_id} onValueChange={(val) => setData('to_store_id', val)}>
                                            <SelectTrigger className={errors.to_store_id ? 'border-destructive' : ''}>
                                                <SelectValue placeholder="Pilih Toko Tujuan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {stores.map(store => (
                                                    <SelectItem key={store.id} value={store.id.toString()}>{store.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.to_store_id && <p className="text-xs text-destructive">{errors.to_store_id}</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Catatan Tambahan</CardTitle>
                                    <CardDescription>Informasi pendukung mengenai mutasi ini.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-2">
                                        <Label htmlFor="notes">Keterangan / Alasan Mutasi</Label>
                                        <Textarea 
                                            id="notes" 
                                            value={data.notes} 
                                            onChange={e => setData('notes', e.target.value)}
                                            placeholder="Contoh: Stok menipis di cabang ini..."
                                            rows={5}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Daftar Barang</CardTitle>
                                <CardDescription>Cari dan tambahkan produk yang akan dipindahkan.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="relative">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                            <Input 
                                                placeholder="Cari Produk (Nama / SKU)..." 
                                                className="pl-9"
                                                value={searchTerm}
                                                onChange={e => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    
                                    {searchTerm && filteredProducts.length > 0 && (
                                        <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 overflow-hidden">
                                            {filteredProducts.map(product => (
                                                <div 
                                                    key={product.id}
                                                    className="p-3 hover:bg-muted cursor-pointer flex justify-between items-center border-b last:border-0"
                                                    onClick={() => addItem(product)}
                                                >
                                                    <div>
                                                        <p className="font-semibold text-sm">{product.name}</p>
                                                        <p className="text-xs text-muted-foreground">{product.sku}</p>
                                                    </div>
                                                    <Button size="sm" variant="ghost" type="button">
                                                        <Plus className="size-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nama Produk</TableHead>
                                            <TableHead>SKU</TableHead>
                                            <TableHead className="w-[150px]">Jumlah</TableHead>
                                            <TableHead className="text-right w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.items.length > 0 ? (
                                            data.items.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-medium text-sm">{item.product_name}</TableCell>
                                                    <TableCell className="text-xs text-muted-foreground">{item.sku}</TableCell>
                                                    <TableCell>
                                                        <Input 
                                                            type="number" 
                                                            min="0.01" 
                                                            step="0.01"
                                                            value={item.qty}
                                                            onChange={e => updateItemQty(index, parseFloat(e.target.value) || 0)}
                                                            className="h-8"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            type="button"
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => removeItem(index)}
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground italic">
                                                    Belum ada barang yang ditambahkan.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                                {errors.items && <p className="text-xs text-destructive">{errors.items}</p>}
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-3">
                            <Link href="/stock-transfers">
                                <Button variant="ghost" type="button" disabled={processing}>Batal</Button>
                            </Link>
                            <Button type="submit" className="gap-2" disabled={processing || data.items.length === 0}>
                                <Save className="size-4" /> {processing ? 'Menyimpan...' : 'Simpan Mutasi'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
