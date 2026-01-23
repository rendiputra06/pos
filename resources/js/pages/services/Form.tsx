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
import { ChevronLeft, Save, Loader2, Plus, Trash2, Info } from 'lucide-react';
import InputError from '@/components/input-error';

interface Category {
  id: number;
  name: string;
}

interface PriceLevel {
  id?: number;
  min_qty: number;
  max_qty: number | string | null;
  price: number;
}

interface Service {
  id: number;
  category_id: number;
  name: string;
  base_price: number;
  price_levels: PriceLevel[];
}

interface Props {
  service?: Service;
  categories: Category[];
}

export default function ServiceForm({ service, categories }: Props) {
  const isEdit = !!service;
  
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Layanan & Jasa', href: '/services' },
    { title: isEdit ? 'Edit Layanan' : 'Tambah Layanan', href: '#' },
  ];

  const { data, setData, post, put, processing, errors } = useForm({
    category_id: service?.category_id.toString() || '',
    name: service?.name || '',
    base_price: service?.base_price || 0,
    price_levels: service?.price_levels.map(p => ({
        min_qty: p.min_qty,
        max_qty: p.max_qty || '',
        price: p.price
    })) || [] as any[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      put(`/services/${service.id}`);
    } else {
      post('/services');
    }
  };

  const addPriceLevel = () => {
    setData('price_levels', [
        ...data.price_levels,
        { min_qty: '', max_qty: '', price: '' }
    ]);
  };

  const removePriceLevel = (index: number) => {
    const newLevels = [...data.price_levels];
    newLevels.splice(index, 1);
    setData('price_levels', newLevels);
  };

  const updatePriceLevel = (index: number, field: string, value: any) => {
    const newLevels = [...data.price_levels];
    newLevels[index] = { ...newLevels[index], [field]: value };
    setData('price_levels', newLevels);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={isEdit ? 'Edit Layanan' : 'Tambah Layanan'} />
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/services">
            <Button variant="ghost" size="icon" className="size-10 rounded-full">
              <ChevronLeft className="size-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEdit ? 'Ubah Layanan Jasa' : 'Daftarkan Jasa Baru'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="shadow-sm border-2">
            <CardHeader>
              <CardTitle>Informasi Dasar</CardTitle>
              <CardDescription>Nama layanan dan harga satuan (per lembar/per item).</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="grid gap-2 md:col-span-1">
                  <Label htmlFor="category_id">Kategori Jasa</Label>
                  <Select
                    value={data.category_id}
                    onValueChange={(value) => setData('category_id', value)}
                  >
                    <SelectTrigger className="h-11">
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

                <div className="grid gap-2 md:col-span-1">
                    <Label htmlFor="name">Nama Layanan</Label>
                    <Input
                        id="name"
                        placeholder="Contoh: Fotocopy A4 H/P"
                        className="h-11"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                    />
                    <InputError message={errors.name} />
                </div>

                <div className="grid gap-2 md:col-span-1">
                    <Label htmlFor="base_price">Harga Satuan (Normal)</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">Rp</span>
                        <Input
                            id="base_price"
                            type="number"
                            className="pl-9 h-11 font-bold text-emerald-600"
                            value={data.base_price}
                            onChange={(e) => setData('base_price', Number(e.target.value))}
                        />
                    </div>
                    <InputError message={errors.base_price} />
                </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-dashed border-2 bg-muted/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Harga Bertingkat (Wholesale)</CardTitle>
                <CardDescription>Berikan diskon otomatis untuk pemesanan jumlah besar.</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" className="gap-2" onClick={addPriceLevel}>
                <Plus className="size-4" /> Tambah Level
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.price_levels.length === 0 ? (
                <div className="py-8 text-center border-2 border-dashed rounded-lg bg-card">
                    <p className="text-sm text-muted-foreground">Tidak menggunakan harga bertingkat.</p>
                </div>
              ) : (
                <div className="space-y-3">
                    {data.price_levels.map((level, index) => (
                        <div key={index} className="flex flex-col md:flex-row items-end gap-3 bg-card p-3 rounded-lg border shadow-sm relative group">
                            <div className="grid gap-1.5 flex-1">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Min. Qty</Label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={level.min_qty}
                                    onChange={(e) => updatePriceLevel(index, 'min_qty', e.target.value)}
                                />
                            </div>
                            <div className="grid gap-1.5 flex-1">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Max. Qty</Label>
                                <Input
                                    type="number"
                                    placeholder="∞"
                                    value={level.max_qty}
                                    onChange={(e) => updatePriceLevel(index, 'max_qty', e.target.value)}
                                />
                            </div>
                            <div className="grid gap-1.5 flex-1">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Harga Satuan Baru</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">Rp</span>
                                    <Input
                                        type="number"
                                        className="pl-8 font-bold text-emerald-600"
                                        value={level.price}
                                        onChange={(e) => updatePriceLevel(index, 'price', e.target.value)}
                                    />
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-10 text-destructive hover:bg-destructive/10"
                                onClick={() => removePriceLevel(index)}
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </div>
                    ))}
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-start gap-3">
                <Info className="size-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  <strong>Penting:</strong> Masukkan jumlah lembar minimum dan harga khusus untuk jumlah tersebut. 
                  Contoh: Min 101 Lembar, Harga Rp 250. Sistem akan otomatis menerapkan harga ini di Kasir saat kuantitas mencapai target.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
             <Link href="/services">
                <Button variant="outline" size="lg" type="button">Batal</Button>
             </Link>
             <Button type="submit" size="lg" className="px-10 gap-2 h-12 shadow-lg" disabled={processing}>
                {processing ? (
                <Loader2 className="size-5 animate-spin" />
                ) : (
                <Save className="size-5" />
                )}
                {isEdit ? 'Simpan Perubahan' : 'Daftarkan Jasa'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
