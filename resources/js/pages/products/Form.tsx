import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { type BreadcrumbItem } from '@/types';
import { ChevronLeft, Save, Loader2, Info } from 'lucide-react';
import InputError from '@/components/input-error';

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  category_id: number;
  name: string;
  sku: string;
  barcode: string | null;
  cost_price: number;
  price: number;
  stock: number;
  unit: string;
}

interface Props {
  product?: Product;
  categories: Category[];
}

export default function ProductForm({ product, categories }: Props) {
  const isEdit = !!product;
  
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Data Produk', href: '/products' },
    { title: isEdit ? 'Edit Produk' : 'Tambah Produk', href: '#' },
  ];

  const { data, setData, post, put, processing, errors } = useForm({
    category_id: product?.category_id.toString() || '',
    name: product?.name || '',
    sku: product?.sku || '',
    barcode: product?.barcode || '',
    cost_price: product?.cost_price || 0,
    price: product?.price || 0,
    stock: product?.stock || 0,
    unit: product?.unit || 'pcs',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      put(`/products/${product.id}`);
    } else {
      post('/products');
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={isEdit ? 'Edit Produk' : 'Tambah Produk'} />
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/products">
            <Button variant="ghost" size="icon" className="size-10 rounded-full">
              <ChevronLeft className="size-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEdit ? 'Ubah Data Produk' : 'Input Produk Baru'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Detail Produk</CardTitle>
                <CardDescription>Informasi dasar mengenai barang yang dijual.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nama Produk</Label>
                  <Input
                    id="name"
                    placeholder="Contoh: Buku Sidu 38 Lembar"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                  />
                  <InputError message={errors.name} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
                        <Input
                            id="sku"
                            placeholder="Dikosongkan untuk auto-gen"
                            value={data.sku}
                            onChange={(e) => setData('sku', e.target.value)}
                        />
                        <InputError message={errors.sku} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="barcode">Barcode (Opsional)</Label>
                        <Input
                            id="barcode"
                            placeholder="Scan atau ketik barcode"
                            value={data.barcode}
                            onChange={(e) => setData('barcode', e.target.value)}
                        />
                        <InputError message={errors.barcode} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="category_id">Kategori</Label>
                        <Select
                            value={data.category_id}
                            onValueChange={(value) => setData('category_id', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id.toString()}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.category_id} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="unit">Satuan Jual</Label>
                        <Input
                            id="unit"
                            placeholder="pcs, rim, pack, dll"
                            value={data.unit}
                            onChange={(e) => setData('unit', e.target.value)}
                        />
                        <InputError message={errors.unit} />
                    </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Keuangan & Stok</CardTitle>
                    <CardDescription>Atur harga beli, harga jual, dan jumlah stok saat ini.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="cost_price">Harga Modal</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">Rp</span>
                            <Input
                                id="cost_price"
                                type="number"
                                className="pl-8"
                                value={data.cost_price}
                                onChange={(e) => setData('cost_price', Number(e.target.value))}
                            />
                        </div>
                        <InputError message={errors.cost_price} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="price">Harga Jual</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">Rp</span>
                            <Input
                                id="price"
                                type="number"
                                className="pl-8 font-bold text-emerald-600"
                                value={data.price}
                                onChange={(e) => setData('price', Number(e.target.value))}
                            />
                        </div>
                        <InputError message={errors.price} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="stock">Stok Awal</Label>
                        <Input
                            id="stock"
                            type="number"
                            value={data.stock}
                            onChange={(e) => setData('stock', Number(e.target.value))}
                        />
                        <InputError message={errors.stock} />
                    </div>
                </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                    <Info className="size-4 text-primary" /> Informasi
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <p>• Data produk ini akan muncul di modul Kasir (POS).</p>
                <p>• SKU akan di-generate otomatis jika dikosongkan.</p>
                <p>• Sistem akan memberikan peringatan jika stok di bawah 5.</p>
              </CardContent>
            </Card>

            <Button type="submit" size="lg" className="w-full gap-2 h-12 text-lg shadow-lg" disabled={processing}>
                {processing ? (
                <Loader2 className="size-5 animate-spin" />
                ) : (
                <Save className="size-5" />
                )}
                {isEdit ? 'Simpan' : 'Rekam Produk'}
            </Button>
            <Link href="/products" className="block">
                <Button variant="outline" className="w-full" type="button">Batal</Button>
            </Link>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
