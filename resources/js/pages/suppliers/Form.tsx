import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { type BreadcrumbItem } from '@/types';
import { ChevronLeft, Save, Loader2, User, Phone, Mail, MapPin } from 'lucide-react';
import InputError from '@/components/input-error';

interface Supplier {
  id: number;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
}

interface Props {
  supplier?: Supplier;
}

export default function SupplierForm({ supplier }: Props) {
  const isEdit = !!supplier;
  
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Supplier', href: '/suppliers' },
    { title: isEdit ? 'Edit Supplier' : 'Tambah Supplier', href: '#' },
  ];

  const { data, setData, post, put, processing, errors } = useForm({
    name: supplier?.name || '',
    contact_person: supplier?.contact_person || '',
    phone: supplier?.phone || '',
    email: supplier?.email || '',
    address: supplier?.address || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      put(`/suppliers/${supplier.id}`);
    } else {
      post('/suppliers');
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={isEdit ? 'Edit Supplier' : 'Tambah Supplier'} />
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/suppliers">
            <Button variant="ghost" size="icon" className="size-10 rounded-full">
              <ChevronLeft className="size-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEdit ? 'Ubah Data Supplier' : 'Daftarkan Supplier Baru'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="shadow-lg border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                 <User className="size-5 text-primary" />
                 Profil Utama
              </CardTitle>
              <CardDescription>
                Masukkan nama perusahaan atau toko supplier beserta orang yang bisa dihubungi.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="font-semibold text-sm">Nama Supplier <span className="text-destructive">*</span></Label>
                <Input
                  id="name"
                  placeholder="Contoh: PT. ATK Jaya, Grosir Sidu..."
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  className={`h-11 ${errors.name ? 'border-destructive' : ''}`}
                />
                <InputError message={errors.name} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="contact_person" className="font-semibold text-sm">Nama Kontak (PIC)</Label>
                <Input
                  id="contact_person"
                  placeholder="Nama orang yang bisa dihubungi"
                  value={data.contact_person}
                  onChange={(e) => setData('contact_person', e.target.value)}
                  className="h-11"
                />
                <InputError message={errors.contact_person} />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                 <Phone className="size-5 text-primary" />
                 Informasi Kontak & Lokasi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="phone" className="font-semibold text-sm">Nomor Telepon/WA</Label>
                  <Input
                    id="phone"
                    placeholder="0812..."
                    value={data.phone}
                    onChange={(e) => setData('phone', e.target.value)}
                    className="h-11"
                  />
                  <InputError message={errors.phone} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="font-semibold text-sm">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="supplier@mail.com"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    className="h-11"
                  />
                  <InputError message={errors.email} />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address" className="font-semibold text-sm">Alamat Lengkap</Label>
                <Textarea
                  id="address"
                  placeholder="Alamat kantor atau gudang supplier..."
                  value={data.address}
                  onChange={(e) => setData('address', e.target.value)}
                  className="min-h-[100px] resize-none"
                />
                <InputError message={errors.address} />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
            <Button type="submit" size="lg" className="w-full md:w-auto px-12 gap-2 h-12 shadow-md" disabled={processing}>
              {processing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {isEdit ? 'Simpan Perubahan' : 'Daftarkan Supplier'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
