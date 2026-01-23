import React, { useState, useEffect, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { Search, FolderPlus, RotateCcw, Trash2, Edit2, ChevronLeft, ChevronRight, Tags } from 'lucide-react';
import { debounce } from 'lodash';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Kategori Produk & Jasa',
    href: '/categories',
  },
];

interface Category {
  id: number;
  name: string;
  slug: string;
  type: 'product' | 'service';
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface Props {
  categories: {
    data: Category[];
    links: PaginationLink[];
    total: number;
    from: number;
    to: number;
  };
  filters: {
    search?: string;
  };
}

export default function CategoryIndex({ categories, filters }: Props) {
  const [search, setSearch] = useState(filters.search || '');

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      router.get('/categories', { search: value }, {
        preserveState: true,
        replace: true,
      });
    }, 500),
    []
  );

  useEffect(() => {
    if (search !== (filters.search || '')) {
      debouncedSearch(search);
    }
  }, [search]);

  const handleDelete = (id: number) => {
    router.delete(`/categories/${id}`, {
      preserveScroll: true,
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Kategori Produk & Jasa" />
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Kategori</h1>
            <p className="text-muted-foreground mt-1">Kelola pengelompokan produk ATK dan jenis layanan jasa.</p>
          </div>
          <Link href="/categories/create">
            <Button className="w-full md:w-auto gap-2" size="lg">
              <FolderPlus className="size-4" /> Tambah Kategori
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="flex flex-col md:flex-row gap-4 bg-card p-4 rounded-xl border shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama kategori..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
          {filters.search && (
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 shrink-0"
                onClick={() => {
                  setSearch('');
                  router.get('/categories', {}, { preserveState: true });
                }}
              >
                <RotateCcw className="size-4" />
              </Button>
          )}
        </div>

        {/* List */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold">Nama Kategori</th>
                  <th className="px-6 py-4 font-semibold">Jenis</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {categories.data.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground italic">
                      Tidak ada kategori ditemukan.
                    </td>
                  </tr>
                ) : (
                  categories.data.map((category) => (
                    <tr key={category.id} className="hover:bg-muted/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Tags className="size-4 text-primary" />
                          <span className="font-medium">{category.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {category.type === 'product' ? (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-2 py-0.5 text-[10px] uppercase font-bold">Produk (ATK)</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none px-2 py-0.5 text-[10px] uppercase font-bold">Layanan (Jasa)</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/categories/${category.id}/edit`}>
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
                                <AlertDialogTitle>Hapus Kategori?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Kategori <strong>{category.name}</strong> akan dihapus permanen. Produk/Jasa di dalamnya mungkin juga akan terpengaruh.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(category.id)} className="bg-destructive hover:bg-destructive/90 text-white">
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
              Menampilkan <span className="font-bold text-foreground">{categories.from || 0}</span> - <span className="font-bold text-foreground">{categories.to || 0}</span> dari <span className="font-bold text-foreground">{categories.total}</span> data
            </div>
            <div className="flex items-center gap-1">
              {categories.links.map((link, i) => {
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
