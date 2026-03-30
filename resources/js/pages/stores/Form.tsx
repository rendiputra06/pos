import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { type BreadcrumbItem } from '@/types';
import { ChevronLeft, Save, Store, Printer } from 'lucide-react';

interface StoreData {
  id: number;
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
  is_active: boolean;
  receipt_header: string | null;
  receipt_footer: string | null;
}

interface Props {
  store?: StoreData;
}

export default function StoreForm({ store }: Props) {
  const { data, setData, post, put, processing, errors } = useForm({
    name: store?.name || '',
    slug: store?.slug || '',
    address: store?.address || '',
    phone: store?.phone || '',
    is_active: store ? store.is_active : true,
    receipt_header: store?.receipt_header || '',
    receipt_footer: store?.receipt_footer || '',
  });

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Manajemen Toko', href: '/stores' },
    { title: store ? 'Edit Toko' : 'Tambah Toko', href: '#' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (store) {
      put(`/stores/${store.id}`);
    } else {
      post('/stores');
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={store ? 'Edit Toko' : 'Tambah Toko'} />
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/stores">
            <Button variant="outline" size="icon">
              <ChevronLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{store ? 'Edit Toko' : 'Tambah Toko Baru'}</h1>
            <p className="text-muted-foreground mt-1">Konfigurasikan informasi dasar untuk cabang toko ini.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="size-5 text-primary" /> Informasi Utama
                </CardTitle>
                <CardDescription>Detail profil toko dan identitas cabang.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nama Toko <span className="text-destructive">*</span></Label>
                  <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Contoh: Toko Berkah Cabang 1"
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="slug">Slug / Kode (Opsional)</Label>
                  <Input
                    id="slug"
                    value={data.slug}
                    onChange={(e) => setData('slug', e.target.value)}
                    placeholder="toko-berkah-c1"
                    className={errors.slug ? 'border-destructive' : ''}
                  />
                  <p className="text-[10px] text-muted-foreground italic">Kosongkan untuk generate otomatis dari nama.</p>
                  {errors.slug && <p className="text-xs text-destructive">{errors.slug}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="phone">Nomor Telepon</Label>
                        <Input
                            id="phone"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            placeholder="0812..."
                            className={errors.phone ? 'border-destructive' : ''}
                        />
                        {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="is_active">Status Toko</Label>
                        <Select 
                            value={data.is_active ? '1' : '0'} 
                            onValueChange={(checked) => setData('is_active', checked === '1')}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">Aktif</SelectItem>
                                <SelectItem value="0">Non-Aktif</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="address">Alamat Lengkap</Label>
                  <Textarea
                    id="address"
                    value={data.address}
                    onChange={(e) => setData('address', e.target.value)}
                    placeholder="Alamat lengkap lokasi toko..."
                    rows={3}
                    className={errors.address ? 'border-destructive' : ''}
                  />
                  {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Printer className="size-5 text-primary" /> Pengaturan Struk
                </CardTitle>
                <CardDescription>Sesuaikan pesan yang muncul di bagian atas dan bawah cetak struk.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="receipt_header">Header Struk</Label>
                  <Textarea
                    id="receipt_header"
                    value={data.receipt_header}
                    onChange={(e) => setData('receipt_header', e.target.value)}
                    placeholder="Contoh: Selamat Datang di Toko Kami!"
                    rows={3}
                  />
                  <p className="text-[10px] text-muted-foreground italic">Muncul di posisi teratas setelah detail toko.</p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="receipt_footer">Footer Struk</Label>
                  <Textarea
                    id="receipt_footer"
                    value={data.receipt_footer}
                    onChange={(e) => setData('receipt_footer', e.target.value)}
                    placeholder="Contoh: Terima kasih atas kunjungan Anda!"
                    rows={3}
                  />
                  <p className="text-[10px] text-muted-foreground italic">Muncul di posisi terbawah setelah total transaksi.</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Link href="/stores">
                <Button variant="ghost" type="button" disabled={processing}>Batal</Button>
              </Link>
              <Button type="submit" className="gap-2" disabled={processing}>
                <Save className="size-4" /> {store ? 'Simpan Perubahan' : 'Buat Toko'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
