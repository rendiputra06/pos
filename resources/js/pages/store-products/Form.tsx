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
import { ChevronLeft, Save, Package } from 'lucide-react';

interface ProductBank {
  id: number;
  name: string;
  sku: string;
  unit: string;
}

interface StoreProduct {
  id: number;
  product_bank_id: number;
  cost_price: number;
  price: number;
  stock: number;
  is_active: boolean;
  product_bank?: ProductBank;
}

interface Props {
  storeProduct?: StoreProduct;
  availableProducts?: ProductBank[];
}

export default function StoreProductForm({ storeProduct, availableProducts = [] }: Props) {
  const { data, setData, post, put, processing, errors } = useForm({
    product_bank_id: storeProduct?.product_bank_id?.toString() || '',
    cost_price: storeProduct?.cost_price || 0,
    price: storeProduct?.price || 0,
    stock: storeProduct?.stock || 0,
    is_active: storeProduct ? storeProduct.is_active : true,
  });

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Stok Toko', href: '/store-products' },
    { title: storeProduct ? 'Edit Pengaturan Stok' : 'Aktifkan Produk', href: '#' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (storeProduct) {
      put(`/store-products/${storeProduct.id}`);
    } else {
      post('/store-products');
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={storeProduct ? 'Edit Stok' : 'Aktifkan Produk'} />
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/store-products">
            <Button variant="outline" size="icon">
              <ChevronLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{storeProduct ? 'Edit Pengaturan Stok' : 'Aktifkan Produk Baru'}</h1>
            <p className="text-muted-foreground mt-1">Tentukan harga dan stok awal untuk produk dari katalog global.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="size-5 text-primary" /> Detail Stok & Harga
                </CardTitle>
                <CardDescription>Informasi ini hanya berlaku untuk toko yang sedang aktif.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="product_bank_id">Pilih Produk dari Katalog <span className="text-destructive">*</span></Label>
                  {storeProduct ? (
                      <div className="p-3 bg-muted rounded-lg font-medium">
                          {storeProduct.product_bank?.name} ({storeProduct.product_bank?.sku})
                      </div>
                  ) : (
                    <Select 
                      value={data.product_bank_id} 
                      onValueChange={(value) => setData('product_bank_id', value)}
                    >
                      <SelectTrigger className={errors.product_bank_id ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Cari di katalog global..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableProducts.map((p) => (
                          <SelectItem key={p.id} value={p.id.toString()}>
                            {p.name} ({p.sku})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {errors.product_bank_id && <p className="text-xs text-destructive">{errors.product_bank_id}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="cost_price">Harga Modal (Current)</Label>
                    <Input
                      id="cost_price"
                      type="number"
                      value={data.cost_price}
                      onChange={(e) => setData('cost_price', Number(e.target.value))}
                      className={errors.cost_price ? 'border-destructive' : ''}
                    />
                    {errors.cost_price && <p className="text-xs text-destructive">{errors.cost_price}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="price">Harga Jual</Label>
                    <Input
                      id="price"
                      type="number"
                      value={data.price}
                      onChange={(e) => setData('price', Number(e.target.value))}
                      className={errors.price ? 'border-destructive' : ''}
                    />
                    {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="stock">Stok Awal</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={data.stock}
                      onChange={(e) => setData('stock', Number(e.target.value))}
                      className={errors.stock ? 'border-destructive' : ''}
                    />
                    {errors.stock && <p className="text-xs text-destructive">{errors.stock}</p>}
                  </div>
                    <div className="grid gap-2">
                        <Label htmlFor="is_active">Status Produk</Label>
                        <Select 
                            value={data.is_active ? '1' : '0'} 
                            onValueChange={(checked) => setData('is_active', checked === '1')}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">Aktifkan di Toko</SelectItem>
                                <SelectItem value="0">Sembunyikan / Non-Aktif</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Link href="/store-products">
                <Button variant="ghost" type="button" disabled={processing}>Batal</Button>
              </Link>
              <Button type="submit" className="gap-2" disabled={processing}>
                <Save className="size-4" /> {storeProduct ? 'Perbarui Pengaturan' : 'Aktifkan Produk'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
