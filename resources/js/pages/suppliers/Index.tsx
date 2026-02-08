import React, { useState, useEffect, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
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
import { Search, UserPlus, RotateCcw, Trash2, Edit2, ChevronLeft, ChevronRight, User, Phone, Mail, MapPin } from 'lucide-react';
import { debounce } from 'lodash';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Supplier',
    href: '/suppliers',
  },
];

interface Supplier {
  id: number;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface Props {
  suppliers: {
    data: Supplier[];
    links: PaginationLink[];
    total: number;
    from: number;
    to: number;
  };
  filters: {
    search?: string;
  };
}

export default function SupplierIndex({ suppliers, filters }: Props) {
  const [search, setSearch] = useState(filters.search || '');

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      router.get('/suppliers', { search: value }, {
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
    router.delete(`/suppliers/${id}`, {
      preserveScroll: true,
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Manajemen Supplier" />
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Supplier</h1>
            <p className="text-muted-foreground mt-1">Kelola data pemasok barang ATK dan perlengkapan toko.</p>
          </div>
          <Link href="/suppliers/create">
            <Button className="w-full md:w-auto gap-2" size="lg">
              <UserPlus className="size-4" /> Tambah Supplier
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="flex flex-col md:flex-row gap-4 bg-card p-4 rounded-xl border shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama supplier, kontak, atau email..."
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
                  router.get('/suppliers', {}, { preserveState: true });
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
                  <th className="px-6 py-4 font-semibold">Nama Supplier</th>
                  <th className="px-6 py-4 font-semibold">Kontak</th>
                  <th className="px-6 py-4 font-semibold">Alamat</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {suppliers.data.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground italic">
                      Tidak ada data supplier ditemukan.
                    </td>
                  </tr>
                ) : (
                  suppliers.data.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-muted/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="size-4 text-primary" />
                          </div>
                          <span className="font-bold text-foreground">{supplier.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {supplier.contact_person && (
                            <div className="text-xs font-semibold">{supplier.contact_person}</div>
                          )}
                          <div className="flex flex-col gap-1 text-[10px] text-muted-foreground uppercase tracking-wider">
                            {supplier.phone && (
                              <span className="flex items-center gap-1"><Phone className="size-3" /> {supplier.phone}</span>
                            )}
                            {supplier.email && (
                              <span className="flex items-center gap-1"><Mail className="size-3" /> {supplier.email}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-start gap-2 max-w-[200px]">
                            <MapPin className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                            <span className="text-xs text-muted-foreground line-clamp-2">{supplier.address || '-'}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/suppliers/${supplier.id}/edit`}>
                            <Button size="icon" variant="ghost" className="size-8 shadow-sm">
                              <Edit2 className="size-3.5" />
                            </Button>
                          </Link>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10 shadow-sm">
                                <Trash2 className="size-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Supplier?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Data supplier <strong>{supplier.name}</strong> akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(supplier.id)} className="bg-destructive hover:bg-destructive/90 text-white">
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
              Menampilkan <span className="font-bold text-foreground">{suppliers.from || 0}</span> - <span className="font-bold text-foreground">{suppliers.to || 0}</span> dari <span className="font-bold text-foreground">{suppliers.total}</span> data
            </div>
            <div className="flex items-center gap-1">
              {suppliers.links.map((link, i) => {
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
