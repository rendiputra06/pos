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
  Search, 
  Truck, 
  RotateCcw, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  HandHelping, 
  Calendar, 
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Eye
} from 'lucide-react';
import { debounce } from 'lodash';
import { formatCurrency } from '@/lib/currency';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Stok Masuk',
    href: '/purchases',
  },
];

interface Purchase {
  id: number;
  invoice_number: string;
  purchase_date: string;
  total_amount: string;
  status: 'pending' | 'received' | 'canceled';
  supplier: {
    name: string;
  };
  creator: {
    name: string;
  };
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface Props {
  purchases: {
    data: Purchase[];
    links: PaginationLink[];
    total: number;
    from: number;
    to: number;
  };
  filters: {
    search?: string;
    status?: string;
  };
}

export default function PurchaseIndex({ purchases, filters }: Props) {
  const [search, setSearch] = useState(filters.search || '');

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      router.get('/purchases', { search: value, status: filters.status }, {
        preserveState: true,
        replace: true,
      });
    }, 500),
    [filters.status]
  );

  useEffect(() => {
    if (search !== (filters.search || '')) {
      debouncedSearch(search);
    }
  }, [search]);

  const handleDelete = (id: number) => {
    router.delete(`/purchases/${id}`, {
      preserveScroll: true,
    });
  };

  const handleUpdateStatus = (id: number, status: string) => {
    router.patch(`/purchases/${id}/status`, { status }, {
        preserveScroll: true,
    });
  }


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'received':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none gap-1 font-bold"><CheckCircle2 className="size-3" /> Diterima</Badge>;
      case 'canceled':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none gap-1 font-bold"><XCircle className="size-3" /> Dibatalkan</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none gap-1 font-bold"><Clock className="size-3" /> Pending</Badge>;
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Stok Masuk (Purchases)" />
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Stok Masuk</h1>
            <p className="text-muted-foreground mt-1">Kelola transaksi pembelian barang dari supplier untuk menambah stok.</p>
          </div>
          <Link href="/purchases/create">
            <Button className="w-full md:w-auto gap-2" size="lg">
              <Truck className="size-4" /> Catat Stok Masuk
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="flex flex-col md:flex-row gap-4 bg-card p-4 rounded-xl border shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Cari nomor faktur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
          <div className="flex gap-2">
             <Button 
                variant={!filters.status ? "default" : "outline"} 
                size="sm"
                onClick={() => router.get('/purchases', { search, status: '' })}
             >Semua</Button>
             <Button 
                variant={filters.status === 'pending' ? "default" : "outline"} 
                size="sm"
                className={filters.status === 'pending' ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                onClick={() => router.get('/purchases', { search, status: 'pending' })}
             >Pending</Button>
             <Button 
                variant={filters.status === 'received' ? "default" : "outline"} 
                size="sm"
                className={filters.status === 'received' ? "bg-green-600 hover:bg-green-700" : ""}
                onClick={() => router.get('/purchases', { search, status: 'received' })}
             >Diterima</Button>
          </div>
        </div>

        {/* List */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold">No. Faktur</th>
                  <th className="px-6 py-4 font-semibold">Supplier</th>
                  <th className="px-6 py-4 font-semibold">Tanggal / Kasir</th>
                  <th className="px-6 py-4 font-semibold">Total</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {purchases.data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">
                      Tidak ada transaksi pembelian ditemukan.
                    </td>
                  </tr>
                ) : (
                  purchases.data.map((purchase) => (
                    <tr key={purchase.id} className="hover:bg-muted/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <FileText className="size-4 text-muted-foreground" />
                           <span className="font-bold text-foreground font-mono">{purchase.invoice_number}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 font-medium">
                           <HandHelping className="size-4 text-primary" />
                           {purchase.supplier.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs">
                             <Calendar className="size-3" /> {new Date(purchase.purchase_date).toLocaleDateString('id-ID')}
                          </div>
                          <div className="text-[10px] uppercase text-muted-foreground font-semibold">Oleh: {purchase.creator.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-primary">{formatCurrency(Number(purchase.total_amount))}</span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(purchase.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-1">
                           <Link href={`/purchases/${purchase.id}`}>
                              <Button size="icon" variant="ghost" className="size-8">
                                <Eye className="size-4" />
                              </Button>
                           </Link>

                          {purchase.status === 'pending' && (
                            <>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs text-green-600 border-green-200 hover:bg-green-50">
                                    <CheckCircle2 className="size-3.5" /> Terima
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Terima Barang?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Stok produk akan otomatis bertambah sesuai isi faktur <strong>{purchase.invoice_number}</strong>.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleUpdateStatus(purchase.id, 'received')} className="bg-green-600 hover:bg-green-700 text-white">
                                      Terima Sekarang
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="icon" variant="ghost" className="size-8 text-destructive hover:bg-destructive/10">
                                    <Trash2 className="size-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Hapus Data?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Data pembelian ini akan dihapus permanen.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(purchase.id)} className="bg-destructive hover:bg-destructive/90 text-white">
                                      Hapus
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
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
              Menampilkan <span className="font-bold text-foreground">{purchases.from || 0}</span> - <span className="font-bold text-foreground">{purchases.to || 0}</span> dari <span className="font-bold text-foreground">{purchases.total}</span> data
            </div>
            <div className="flex items-center gap-1">
              {purchases.links.map((link, i) => {
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
