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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, Printer, RotateCcw, Trash2, Edit2, ChevronLeft, ChevronRight, Info, Layers } from 'lucide-react';
import { debounce } from 'lodash';
import { formatCurrency } from '@/lib/currency';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Layanan Jasa (Copy/Print)',
    href: '/services',
  },
];

interface PriceLevel {
  id: number;
  min_qty: number;
  max_qty: number | null;
  price: number;
}

interface Service {
  id: number;
  name: string;
  base_price: number;
  category: {
    id: number;
    name: string;
  };
  price_levels: PriceLevel[];
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface Props {
  services: {
    data: Service[];
    links: PaginationLink[];
    total: number;
    from: number;
    to: number;
  };
  filters: {
    search?: string;
  };
}

export default function ServiceIndex({ services, filters }: Props) {
  const [search, setSearch] = useState(filters.search || '');

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      router.get('/services', { search: value, page: 1 }, {
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
    router.delete(`/services/${id}`, {
      preserveScroll: true,
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Manajemen Layanan Jasa" />
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Layanan & Jasa</h1>
            <p className="text-muted-foreground mt-1">Atur harga jasa fotocopy, cetak, jilid, dan harga bertingkat lainnya.</p>
          </div>
          <Link href="/services/create">
            <Button className="w-full md:w-auto gap-2" size="lg">
              <Printer className="size-4" /> Tambah Layanan
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="flex flex-col md:flex-row gap-4 bg-card p-4 rounded-xl border shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama layanan..."
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
                  router.get('/services', {}, { preserveState: true });
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
                  <th className="px-6 py-4 font-semibold">Nama Layanan</th>
                  <th className="px-6 py-4 font-semibold">Kategori</th>
                  <th className="px-6 py-4 font-semibold">Harga Dasar</th>
                  <th className="px-6 py-4 font-semibold">Harga Bertingkat</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {services.data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">
                      Tidak ada layanan ditemukan.
                    </td>
                  </tr>
                ) : (
                  services.data.map((service) => (
                    <tr key={service.id} className="hover:bg-muted/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                            <Printer className="size-5" />
                          </div>
                          <span className="font-semibold">{service.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline">{service.category.name}</Badge>
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-600">
                        {formatCurrency(Number(service.base_price))}
                      </td>
                      <td className="px-6 py-4">
                        {service.price_levels.length > 0 ? (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-7 gap-1.5 px-2 text-[10px] font-bold uppercase transition-all hover:bg-primary/5">
                                        <Layers className="size-3" /> {service.price_levels.length} Level
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-64 p-3 shadow-xl border-2">
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-bold flex items-center gap-2 border-b pb-2">
                                            <Info className="size-3 text-primary" /> Skema Harga Bertingkat
                                        </h4>
                                        <div className="space-y-1.5">
                                            {service.price_levels.sort((a,b) => a.min_qty - b.min_qty).map((level) => (
                                                <div key={level.id} className="flex justify-between text-xs py-1 px-2 rounded bg-muted/50">
                                                    <span>{level.min_qty}{level.max_qty ? ` - ${level.max_qty}` : '+'} lembar</span>
                                                    <span className="font-bold text-emerald-600">{formatCurrency(level.price)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        ) : (
                            <span className="text-xs text-muted-foreground">Tidak ada</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/services/${service.id}/edit`}>
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
                                <AlertDialogTitle>Hapus Layanan?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Layanan <strong>{service.name}</strong> akan dihapus permanen.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(service.id)} className="bg-destructive hover:bg-destructive/90 text-white">
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
              Menampilkan <span className="font-bold text-foreground">{services.from || 0}</span> - <span className="font-bold text-foreground">{services.to || 0}</span> dari <span className="font-bold text-foreground">{services.total}</span> data
            </div>
            <div className="flex items-center gap-1">
              {services.links.map((link, i) => {
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
