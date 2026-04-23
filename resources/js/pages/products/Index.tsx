import ImportModal from '@/components/ImportModal';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { debounce } from 'lodash';
import {
    AlertCircle,
    Barcode,
    ChevronLeft,
    ChevronRight,
    Download,
    Edit2,
    Filter,
    Package,
    PackagePlus,
    RotateCcw,
    Search,
    Trash2,
    Upload,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Produk (ATK)',
        href: '/products',
    },
];

interface Product {
    id: number;
    name: string;
    sku: string;
    price: number;
    stock: number;
    unit: string;
    has_variants: boolean;
    has_multiple_units?: boolean;
    total_stock?: number;
    min_price?: number;
    max_price?: number;
    average_price?: number;
    active_variants_count?: number;
    thumbnail_url?: string | null;
    medium_url?: string | null;
    original_url?: string | null;
    primary_image_url?: string | null;
    variants_count?: number;
    category: {
        id: number;
        name: string;
    };
    variants?: {
        id: number;
        sku: string;
        price: number;
        stock: number;
        combination: Record<string, string>;
        formatted_combination: string;
    }[];
    base_unit?: {
        id: number;
        name: string;
        price: number;
        stock: number;
    };
    active_units?: {
        id: number;
        name: string;
        price: number;
    }[];
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    products: {
        data: Product[];
        links: PaginationLink[];
        total: number;
        from: number;
        to: number;
    };
    categories: {
        id: number;
        name: string;
    }[];
    filters: {
        search?: string;
        category_id?: string;
        has_variants?: string;
    };
}

export default function ProductIndex({ products, categories, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [showImportModal, setShowImportModal] = useState(false);
    const [exporting, setExporting] = useState(false);

    const debouncedSearch = useCallback(
        debounce((value: string) => {
            router.get(
                '/products',
                { ...filters, search: value, page: 1 },
                {
                    preserveState: true,
                    replace: true,
                },
            );
        }, 500),
        [filters],
    );

    useEffect(() => {
        if (search !== (filters.search || '')) {
            debouncedSearch(search);
        }
    }, [search]);

    const handleCategoryChange = (value: string) => {
        const categoryId = value === 'all' ? undefined : value;
        router.get(
            '/products',
            { ...filters, category_id: categoryId, page: 1 },
            {
                preserveState: true,
            },
        );
    };

    const handleDelete = (id: number) => {
        router.delete(`/products/${id}`, {
            preserveScroll: true,
        });
    };

    const handleExport = () => {
        setExporting(true);
        const params = new URLSearchParams(filters as any).toString();
        window.open(`/products/export${params ? '?' + params : ''}`, '_blank');
        setTimeout(() => setExporting(false), 1000);
    };

    const handleImportComplete = () => {
        // Refresh the page to show imported data
        router.reload({ only: ['products'] });
    };

    const renderProductPrice = (product: Product) => {
        // For multi-unit products, calculate min/max from active units
        if (product.has_multiple_units && product.active_units && product.active_units.length > 0) {
            const prices = product.active_units.map(u => u.price).filter(p => p > 0);
            const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
            const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

            if (minPrice === maxPrice) {
                return (
                    <div className="text-right">
                        <span className="font-bold text-emerald-600">{formatCurrency(minPrice)}</span>
                        <div className="text-muted-foreground text-xs">Semua satuan</div>
                    </div>
                );
            }

            return (
                <div className="text-right">
                    <div className="font-bold text-emerald-600">{formatCurrency(minPrice)}</div>
                    <div className="text-muted-foreground text-xs">sampai {formatCurrency(maxPrice)}</div>
                </div>
            );
        }

        // For variant products, use min/max price from variants with price > 0
        // If no valid variant prices, fall back to product's base price
        const minPrice = product.has_variants
            ? (product.min_price ?? product.price ?? 0)
            : product.price;
        const maxPrice = product.has_variants
            ? (product.max_price ?? product.price ?? 0)
            : product.price;

        if (product.has_variants) {
            // No valid variant prices found (all variants have price 0 or no variants)
            if (!product.min_price && !product.max_price) {
                return (
                    <div className="text-right">
                        <span className="font-bold text-emerald-600">{formatCurrency(product.price)}</span>
                        <div className="text-muted-foreground text-xs">Harga dasar produk</div>
                    </div>
                );
            }

            if (minPrice === maxPrice) {
                return (
                    <div className="text-right">
                        <span className="font-bold text-emerald-600">{formatCurrency(minPrice)}</span>
                        <div className="text-muted-foreground text-xs">Harga variant tunggal</div>
                    </div>
                );
            }

            return (
                <div className="text-right">
                    <div className="font-bold text-emerald-600">{formatCurrency(minPrice)}</div>
                    <div className="text-muted-foreground text-xs">sampai {formatCurrency(maxPrice)}</div>
                </div>
            );
        }

        return <span className="font-bold text-emerald-600">{formatCurrency(product.price)}</span>;
    };

    const renderProductStock = (product: Product) => {
        // For multi-unit products, use base unit stock
        const stockValue = product.has_multiple_units
            ? (product.base_unit?.stock ?? 0)
            : product.has_variants
                ? (product.total_stock ?? 0)
                : product.stock;
        const unitName = product.has_multiple_units
            ? (product.base_unit?.name ?? product.unit)
            : product.unit;
        const isLowStock = stockValue <= 5;

        return (
            <div className="flex flex-col items-center">
                <span className={`font-bold ${isLowStock ? 'text-destructive' : 'text-foreground'}`}>
                    {stockValue} {unitName}
                </span>
                {product.has_multiple_units && <span className="text-amber-600 text-[11px] tracking-wide uppercase">Multi satuan</span>}
                {product.has_variants && <span className="text-muted-foreground text-[11px] tracking-wide uppercase">Total stok variant</span>}
                {isLowStock && (
                    <span className="text-destructive flex items-center gap-0.5 text-[10px] font-bold uppercase">
                        <AlertCircle className="size-2.5" /> Stok Menipis
                    </span>
                )}
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Produk (ATK)" />
            <div className="space-y-6 p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Data Produk</h1>
                        <p className="text-muted-foreground mt-1">Kelola stok barang alat tulis, kertas, dan perlengkapan lainnya.</p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Button variant="outline" onClick={handleExport} disabled={exporting} className="gap-2">
                            <Download className="size-4" />
                            {exporting ? 'Mengekspor...' : 'Export Excel'}
                        </Button>
                        <Button variant="outline" onClick={() => setShowImportModal(true)} className="gap-2">
                            <Upload className="size-4" />
                            Import Excel
                        </Button>
                        <Link href="/products/create">
                            <Button className="gap-2" size="lg">
                                <PackagePlus className="size-4" /> Tambah Produk
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-card flex flex-col gap-4 rounded-xl border p-4 shadow-sm md:flex-row">
                    <div className="relative flex-1">
                        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                        <Input
                            placeholder="Cari nama produk atau SKU..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-10 pl-10"
                        />
                    </div>
                    <div className="flex w-full gap-2 md:w-auto">
                        <div className="relative w-full md:w-[200px]">
                            <Select value={filters.category_id || 'all'} onValueChange={handleCategoryChange}>
                                <SelectTrigger className="h-10">
                                    <div className="flex items-center gap-2">
                                        <Filter className="text-muted-foreground size-3.5" />
                                        <SelectValue placeholder="Semua Kategori" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Kategori</SelectItem>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="relative w-full md:w-[180px]">
                            <Select
                                value={filters.has_variants || 'all'}
                                onValueChange={(value) =>
                                    router.get(
                                        '/products',
                                        { ...filters, has_variants: value === 'all' ? null : value, page: 1 },
                                        { preserveState: true },
                                    )
                                }
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Tipe Produk" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Produk</SelectItem>
                                    <SelectItem value="1">Dengan Variants</SelectItem>
                                    <SelectItem value="0">Tanpa Variants</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {(filters.search || filters.category_id || filters.has_variants) && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 shrink-0"
                                onClick={() => {
                                    setSearch('');
                                    router.get('/products', { has_variants: null }, { preserveState: false });
                                }}
                            >
                                <RotateCcw className="size-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* List */}
                <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-muted-foreground bg-muted/50 border-b text-xs uppercase">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Produk</th>
                                    <th className="px-6 py-4 font-semibold">Kategori</th>
                                    <th className="px-6 py-4 text-center font-semibold">Stok</th>
                                    <th className="px-6 py-4 text-right font-semibold">Harga Jual</th>
                                    <th className="px-6 py-4 text-right font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {products.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-muted-foreground px-6 py-12 text-center italic">
                                            Tidak ada produk ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    products.data.map((product) => (
                                        <tr key={product.id} className="hover:bg-muted/50 group transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-muted relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg">
                                                        {product.primary_image_url ? (
                                                            <img
                                                                src={product.primary_image_url}
                                                                alt={product.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <Package className="text-muted-foreground size-5" />
                                                        )}
                                                        {product.has_variants && (
                                                            <span className="absolute top-1 right-1 rounded-full bg-slate-900/80 px-1.5 py-0.5 text-[9px] font-semibold tracking-wider text-white uppercase">
                                                                Variant
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex min-w-0 flex-col">
                                                        <div className="flex items-center gap-2">
                                                            <span className="max-w-[250px] truncate font-semibold">{product.name}</span>
                                                            {product.has_variants && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    {product.variants_count || 0} Variants
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <span className="text-muted-foreground font-mono text-[10px] tracking-wider uppercase">
                                                            {product.sku}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className="font-medium">
                                                    {product.category.name}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-center">{renderProductStock(product)}</td>
                                            <td className="px-6 py-4 text-right">{renderProductPrice(product)}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-1">
                                                    {product.has_variants && (
                                                        <Link href={`/products/${product.id}/variants`}>
                                                            <Button size="icon" variant="ghost" className="size-8" title="Manage Variants">
                                                                <Package className="size-4" />
                                                            </Button>
                                                        </Link>
                                                    )}
                                                    <Link href={`/products/${product.id}/barcode`}>
                                                        <Button size="icon" variant="ghost" className="size-8" title="Print Barcode">
                                                            <Barcode className="size-4" />
                                                        </Button>
                                                    </Link>

                                                    <Link href={`/products/${product.id}/edit`}>
                                                        <Button size="icon" variant="ghost" className="size-8" title="Edit Product">
                                                            <Edit2 className="size-3.5" />
                                                        </Button>
                                                    </Link>

                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="text-destructive hover:text-destructive hover:bg-destructive/10 size-8"
                                                            >
                                                                <Trash2 className="size-3.5" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Hapus Produk?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Produk <strong>{product.name}</strong> akan dihapus permanen.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDelete(product.id)}
                                                                    className="bg-destructive hover:bg-destructive/90 text-white"
                                                                >
                                                                    Hapus Sekarang
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="bg-muted/30 flex flex-col items-center justify-between gap-4 border-t px-6 py-4 sm:flex-row">
                        <div className="text-muted-foreground text-xs whitespace-nowrap">
                            Menampilkan <span className="text-foreground font-bold">{products.from || 0}</span> -{' '}
                            <span className="text-foreground font-bold">{products.to || 0}</span> dari{' '}
                            <span className="text-foreground font-bold">{products.total}</span> data
                        </div>
                        <div className="flex items-center gap-1">
                            {products.links.map((link, i) => {
                                const isPrev = link.label.includes('Previous');
                                const isNext = link.label.includes('Next');

                                if (isPrev || isNext) {
                                    return (
                                        <Button
                                            key={i}
                                            variant="outline"
                                            size="sm"
                                            className="size-9 p-0"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url)}
                                        >
                                            {isPrev ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
                                        </Button>
                                    );
                                }

                                if (link.label === '...') {
                                    return (
                                        <span key={i} className="text-muted-foreground px-2">
                                            ...
                                        </span>
                                    );
                                }

                                return (
                                    <Button
                                        key={i}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        className="size-9 p-0"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                    >
                                        {link.label}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <ImportModal isOpen={showImportModal} onClose={() => setShowImportModal(false)} onImportComplete={handleImportComplete} />
        </AppLayout>
    );
}
