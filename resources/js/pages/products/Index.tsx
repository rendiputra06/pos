import React, { useState, useEffect, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type BreadcrumbItem } from '@/types';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Search, PackagePlus, RotateCcw, Trash2, Edit2, Filter, ChevronLeft, ChevronRight, Package, AlertCircle } from 'lucide-react';
import { debounce } from 'lodash';

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
  category: {
    id: number;
    name: string;
  };
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
  };
}

export default function ProductIndex({ products, categories, filters }: Props) {
  const [search, setSearch] = useState(filters.search || '');

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      router.get('/products', { ...filters, search: value, page: 1 }, {
        preserveState: true,
        replace: true,
      });
    }, 500),
    [filters]
  );

  useEffect(() => {
    if (search !== (filters.search || '')) {
      debouncedSearch(search);
    }
  }, [search]);

  const handleCategoryChange = (value: string) => {
    const categoryId = value === 'all' ? undefined : value;
    router.get('/products', { ...filters, category_id: categoryId, page: 1 }, {
      preserveState: true,
    });
  };

  const handleDelete = (id: number) => {
    router.delete(`/products/${id}`, {
      preserveScroll: true,
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Manajemen Produk (ATK)" />
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Data Produk</h1>
            <p className="text-muted-foreground mt-1">Kelola stok barang alat tulis, kertas, dan perlengkapan lainnya.</p>
          </div>
          <Link href="/products/create">
            <Button className="w-full md:w-auto gap-2" size="lg">
              <PackagePlus className="size-4" /> Tambah Produk
            </Button>
          </Link>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 bg-card p-4 rounded-xl border shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama produk atau SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-[200px]">
              <Select value={filters.category_id || 'all'} onValueChange={handleCategoryChange}>
                <SelectTrigger className="h-10">
                  <div className="flex items-center gap-2">
                    <Filter className="size-3.5 text-muted-foreground" />
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
            {(filters.search || filters.category_id) && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 shrink-0"
                onClick={() => {
                  setSearch('');
                  router.get('/products', {}, { preserveState: true });
                }}
              >
                <RotateCcw className="size-4" />
              </Button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold">Produk</th>
                  <th className="px-6 py-4 font-semibold">Kategori</th>
                  <th className="px-6 py-4 font-semibold text-center">Stok</th>
                  <th className="px-6 py-4 font-semibold text-right">Harga Jual</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">
                      Tidak ada produk ditemukan.
                    </td>
                  </tr>
                ) : (
                  products.data.map((product) => (
                    <tr key={product.id} className="hover:bg-muted/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                            <Package className="size-5" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold truncate max-w-[250px]">{product.name}</span>
                            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{product.sku}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="font-medium">{product.category.name}</Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className={`font-bold ${product.stock <= 5 ? 'text-destructive' : 'text-foreground'}`}>
                            {product.stock} {product.unit}
                          </span>
                          {product.stock <= 5 && (
                            <span className="flex items-center gap-0.5 text-[10px] text-destructive font-bold uppercase">
                              <AlertCircle className="size-2.5" /> Stok Menipis
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-emerald-600">
                          Rp {Number(product.price).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/products/${product.id}/edit`}>
                            <Button size="icon" variant="ghost" className="size-8">
                              <Edit2 className="size-3.5" />
                            </Button>
                          </Link>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10">
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
                                <AlertDialogAction onClick={() => handleDelete(product.id)} className="bg-destructive hover:bg-destructive/90 text-white">
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
          <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t bg-muted/30">
            <div className="text-xs text-muted-foreground whitespace-nowrap">
              Menampilkan <span className="font-bold text-foreground">{products.from || 0}</span> - <span className="font-bold text-foreground">{products.to || 0}</span> dari <span className="font-bold text-foreground">{products.total}</span> data
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
                  return <span key={i} className="px-2 text-muted-foreground">...</span>;
                }

                return (
                  <Button
                    key={i}
                    variant={link.active ? "default" : "outline"}
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
    </AppLayout>
  );
}
