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
import { ChevronLeft, Save, Loader2 } from 'lucide-react';
import InputError from '@/components/input-error';

interface Category {
  id: number;
  name: string;
  type: 'product' | 'service';
}

interface Props {
  category?: Category;
}

export default function CategoryForm({ category }: Props) {
  const isEdit = !!category;
  
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Kategori', href: '/categories' },
    { title: isEdit ? 'Edit Kategori' : 'Tambah Kategori', href: '#' },
  ];

  const { data, setData, post, put, processing, errors } = useForm({
    name: category?.name || '',
    type: category?.type || 'product',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      put(`/categories/${category.id}`);
    } else {
      post('/categories');
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={isEdit ? 'Edit Kategori' : 'Tambah Kategori'} />
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/categories">
            <Button variant="ghost" size="icon" className="size-10 rounded-full">
              <ChevronLeft className="size-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEdit ? 'Ubah Kategori' : 'Buat Kategori Baru'}
          </h1>
        </div>

        <Card className="shadow-lg border-2">
          <CardHeader>
            <CardTitle>Informasi Kategori</CardTitle>
            <CardDescription>
              Tentukan nama kategori dan jenisnya apakah untuk produk fisik atau layanan jasa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="name" className="font-semibold">Nama Kategori</Label>
                <Input
                  id="name"
                  placeholder="Contoh: Alat Tulis, Jasa Cetak..."
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  className="h-11"
                />
                <InputError message={errors.name} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="type" className="font-semibold">Jenis Kategori</Label>
                <Select
                  value={data.type}
                  onValueChange={(value: 'product' | 'service') => setData('type', value)}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Pilih jenis kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product">Produk Fisik (ATK)</SelectItem>
                    <SelectItem value="service">Layanan (Jasa)</SelectItem>
                  </SelectContent>
                </Select>
                <InputError message={errors.type} />
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" size="lg" className="px-10 gap-2 h-12" disabled={processing}>
                  {processing ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  {isEdit ? 'Simpan Perubahan' : 'Buat Kategori'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
