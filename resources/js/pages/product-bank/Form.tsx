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
import { ChevronLeft, Save, Layers } from 'lucide-react';

interface ProductBank {
  id: number;
  name: string;
  sku: string;
  barcode: string | null;
  unit: string;
  category_id: number;
}

interface Category {
  id: number;
  name: string;
}

interface Props {
  product?: ProductBank;
  categories: Category[];
}

export default function ProductBankForm({ product, categories }: Props) {
  const { data, setData, post, put, processing, errors } = useForm({
    category_id: product?.category_id?.toString() || '',
    name: product?.name || '',
    sku: product?.sku || '',
    barcode: product?.barcode || '',
    unit: product?.unit || 'Pcs',
  });

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Product Bank', href: '/product-bank' },
    { title: product ? 'Edit Katalog' : 'Tambah Katalog', href: '#' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (product) {
      put(`/product-bank/${product.id}`);
    } else {
      post('/product-bank');
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={product ? 'Edit Katalog' : 'Tambah Katalog'} />
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/product-bank">
            <Button variant="outline" size="icon">
              <ChevronLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{product ? 'Edit Katalog' : 'Tambah Katalog Baru'}</h1>
            <p className="text-muted-foreground mt-1">Buat informasi dasar produk yang akan dibagikan ke seluruh toko.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="size-5 text-primary" /> Informasi Katalog
                </CardTitle>
                <CardDescription>Atribut global produk yang bersifat read-only bagi toko.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nama Produk <span className="text-destructive">*</span></Label>
                    <Input
                      id="name"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      placeholder="Contoh: Kertas A4 Sinar Dunia"
                      className={errors.name ? 'border-destructive' : ''}
                    />
                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category_id">Kategori <span className="text-destructive">*</span></Label>
                    <Select 
                      value={data.category_id} 
                      onValueChange={(value) => setData('category_id', value)}
                    >
                      <SelectTrigger className={errors.category_id ? 'border-destructive' : ''}>
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
                    {errors.category_id && <p className="text-xs text-destructive">{errors.category_id}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="sku">SKU Global</Label>
                    <Input
                      id="sku"
                      value={data.sku}
                      onChange={(e) => setData('sku', e.target.value)}
                      placeholder="SKU-12345"
                      className={errors.sku ? 'border-destructive' : ''}
                    />
                    {errors.sku && <p className="text-xs text-destructive">{errors.sku}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="barcode">Barcode</Label>
                    <Input
                      id="barcode"
                      value={data.barcode}
                      onChange={(e) => setData('barcode', e.target.value)}
                      placeholder="899..."
                      className={errors.barcode ? 'border-destructive' : ''}
                    />
                    {errors.barcode && <p className="text-xs text-destructive">{errors.barcode}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="unit">Satuan (Unit)</Label>
                    <Input
                      id="unit"
                      value={data.unit}
                      onChange={(e) => setData('unit', e.target.value)}
                      placeholder="Pcs/Rim/Lusin"
                      className={errors.unit ? 'border-destructive' : ''}
                    />
                    {errors.unit && <p className="text-xs text-destructive">{errors.unit}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Link href="/product-bank">
                <Button variant="ghost" type="button" disabled={processing}>Batal</Button>
              </Link>
              <Button type="submit" className="gap-2" disabled={processing}>
                <Save className="size-4" /> {product ? 'Simpan Perubahan' : 'Simpan Katalog'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
