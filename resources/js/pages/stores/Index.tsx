import React, { useState } from 'react';
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
import { Search, Store, Plus, Trash2, Edit2, ChevronLeft, ChevronRight, Phone, MapPin } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Manajemen Toko',
    href: '/stores',
  },
];

interface StoreData {
  id: number;
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
  is_active: boolean;
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface Props {
  stores: {
    data: StoreData[];
    links: PaginationLink[];
    total: number;
    from: number;
    to: number;
  };
  filters?: {
    search?: string;
  };
}

export default function StoreIndex({ stores, filters }: Props) {
  const [search, setSearch] = useState(filters?.search || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get('/stores', { search: search || undefined }, { preserveState: true });
  };

  const handleDelete = (id: number) => {
    router.delete(`/stores/${id}`, {
      preserveScroll: true,
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Manajemen Toko" />
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manajemen Toko</h1>
            <p className="text-muted-foreground mt-1">Kelola cabang-cabang toko Point of Sale Anda.</p>
          </div>
          <Link href="/stores/create">
            <Button className="w-full md:w-auto gap-2" size="lg">
              <Plus className="size-4" /> Tambah Toko
            </Button>
          </Link>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama toko..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary">Cari</Button>
          {search && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSearch('');
                router.get('/stores', {}, { preserveState: true });
              }}
            >
              Reset
            </Button>
          )}
        </form>

        {/* List */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold">Toko</th>
                  <th className="px-6 py-4 font-semibold">Kontak & Alamat</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {stores.data.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground italic">
                      Tidak ada toko ditemukan.
                    </td>
                  </tr>
                ) : (
                  stores.data.map((store) => (
                    <tr key={store.id} className="hover:bg-muted/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Store className="size-5" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold truncate max-w-[250px]">{store.name}</span>
                            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{store.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                            {store.phone && (
                                <div className="flex items-center gap-1.5">
                                    <Phone className="size-3" /> {store.phone}
                                </div>
                            )}
                            {store.address && (
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="size-3" /> {store.address}
                                </div>
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={store.is_active ? "default" : "secondary"}>
                          {store.is_active ? 'Aktif' : 'Non-Aktif'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/stores/${store.id}/edit`}>
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
                                <AlertDialogTitle>Hapus Toko?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Toko <strong>{store.name}</strong> akan dihapus. Aksi ini tidak dapat dibatalkan jika sudah ada data terkait.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(store.id)} className="bg-destructive hover:bg-destructive/90 text-white">
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
              Menampilkan <span className="font-bold text-foreground">{stores.from || 0}</span> - <span className="font-bold text-foreground">{stores.to || 0}</span> dari <span className="font-bold text-foreground">{stores.total}</span> data
            </div>
            <div className="flex items-center gap-1">
              {stores.links.map((link, i) => {
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
