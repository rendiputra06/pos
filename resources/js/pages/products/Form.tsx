import ImageUpload from '@/components/ImageUpload';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ChevronLeft, Loader2, Package, PackagePlus, Save } from 'lucide-react';
import React, { useState } from 'react';

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
    has_variants: boolean;
    thumbnail_url?: string | null;
    medium_url?: string | null;
    original_url?: string | null;
}

interface Props {
    product?: Product;
    categories: Category[];
}

export default function ProductForm({ product, categories }: Props) {
    const isEdit = !!product;
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [hasVariants, setHasVariants] = useState(product?.has_variants || false);

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
        has_variants: product?.has_variants || false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        Object.keys(data).forEach((key) => {
            const value = data[key as keyof typeof data];

            // Handle boolean values properly
            if (key === 'has_variants') {
                formData.append(key, value ? '1' : '0');
            } else {
                formData.append(key, value.toString());
            }
        });

        if (imageFile) {
            formData.append('image', imageFile);
        }

        if (isEdit) {
            formData.append('_method', 'PUT');
            router.post(`/products/${product.id}`, formData);
        } else {
            router.post('/products', formData);
        }
    };

    const handleImageChange = (file: File | null) => {
        setImageFile(file);
    };

    const handleImageRemove = () => {
        setImageFile(null);
        if (isEdit && product) {
            router.delete(`/products/${product.id}/image`);
        }
    };

    const handleSaveAndInputVariants = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        Object.keys(data).forEach((key) => {
            const value = data[key as keyof typeof data];

            // Handle boolean values properly
            if (key === 'has_variants') {
                formData.append(key, value ? '1' : '0');
            } else {
                formData.append(key, value.toString());
            }
        });

        if (imageFile) {
            formData.append('image', imageFile);
        }

        // Add redirect parameter
        formData.append('redirect_to_variants', '1');

        // Submit form and let controller handle redirect
        router.post('/products', formData);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Edit Produk' : 'Tambah Produk'} />
            <div className="mx-auto max-w-4xl space-y-6 p-6">
                <div className="flex items-center gap-4">
                    <Link href="/products">
                        <Button variant="ghost" size="icon" className="size-10 rounded-full">
                            <ChevronLeft className="size-5" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">{isEdit ? 'Ubah Data Produk' : 'Input Produk Baru'}</h1>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="space-y-6 md:col-span-2">
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        Detail Produk
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="has_variants" className="text-sm font-medium">
                                            Aktifkan Variants
                                        </Label>
                                        <Switch
                                            id="has_variants"
                                            checked={hasVariants}
                                            onCheckedChange={(checked: boolean) => {
                                                setHasVariants(checked);
                                                setData('has_variants', checked);
                                            }}
                                        />
                                    </div>
                                </CardTitle>
                                <CardDescription>
                                    {hasVariants
                                        ? 'Produk akan memiliki variasi dengan harga dan stok terpisah'
                                        : 'Produk tanpa variasi (harga dan stok tunggal)'}
                                </CardDescription>
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

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="category_id">Kategori</Label>
                                        <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
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
                                <CardTitle>Gambar Produk</CardTitle>
                                <CardDescription>Upload gambar produk untuk tampilan yang lebih menarik.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ImageUpload
                                    value={imageFile ? URL.createObjectURL(imageFile) : product?.original_url || null}
                                    onChange={handleImageChange}
                                    onRemove={handleImageRemove}
                                    disabled={processing}
                                    className="max-w-xs"
                                />
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle>Keuangan & Stok</CardTitle>
                                <CardDescription>
                                    {hasVariants
                                        ? 'Harga dan stok diatur per variant di halaman variants'
                                        : 'Atur harga beli, harga jual, dan jumlah stok saat ini.'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className={`grid grid-cols-2 gap-4 md:grid-cols-3 ${hasVariants ? 'pointer-events-none opacity-50' : ''}`}>
                                <div className="grid gap-2">
                                    <Label htmlFor="cost_price">Harga Modal</Label>
                                    <div className="relative">
                                        <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-xs">Rp</span>
                                        <Input
                                            id="cost_price"
                                            type="number"
                                            className="pl-8"
                                            value={data.cost_price}
                                            onChange={(e) => setData('cost_price', Number(e.target.value))}
                                            disabled={hasVariants}
                                        />
                                    </div>
                                    <InputError message={errors.cost_price} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="price">Harga Jual</Label>
                                    <div className="relative">
                                        <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-xs font-bold">Rp</span>
                                        <Input
                                            id="price"
                                            type="number"
                                            className="pl-8 font-bold text-emerald-600"
                                            value={data.price}
                                            onChange={(e) => setData('price', Number(e.target.value))}
                                            disabled={hasVariants}
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
                                        disabled={hasVariants}
                                    />
                                    <InputError message={errors.stock} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="bg-primary/5 border-primary/20">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Save className="h-5 w-5" />
                                    Simpan Produk
                                </CardTitle>
                                <CardDescription>Pilih aksi yang ingin Anda lakukan dengan produk ini</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button type="submit" disabled={processing} className="w-full">
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Simpan Produk
                                        </>
                                    )}
                                </Button>

                                {hasVariants && !isEdit && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={processing}
                                        className="w-full"
                                        onClick={handleSaveAndInputVariants}
                                    >
                                        <PackagePlus className="mr-2 h-4 w-4" />
                                        Simpan dan Input Varian
                                    </Button>
                                )}

                                {hasVariants && isEdit && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={processing}
                                        className="w-full"
                                        onClick={() => router.visit(`/products/${product?.id}/variants`)}
                                    >
                                        <Package className="mr-2 h-4 w-4" />
                                        Kelola Varian
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
