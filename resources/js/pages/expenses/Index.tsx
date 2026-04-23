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
  Plus, 
  RotateCcw, 
  Trash2, 
  Edit2, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  ClipboardList,
  Calendar,
  CreditCard,
  Banknote,
  Image as ImageIcon,
  FileText
} from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import { debounce } from 'lodash';
import { formatCurrency } from '@/lib/currency';
import { type BreadcrumbItem } from '@/types';

dayjs.locale('id');

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Biaya Operasional',
    href: '/expenses',
  },
];

interface Expense {
  id: number;
  category: string;
  description: string;
  amount: number | string;
  expense_date: string;
  payment_method: string;
  receipt_image: string | null;
  notes: string | null;
  creator?: {
    name: string;
  };
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface Props {
  expenses: {
    data: Expense[];
    current_page: number;
    last_page: number;
    links: PaginationLink[];
    total: number;
    from: number;
    to: number;
  };
  filters: {
    search?: string;
    category?: string;
    payment_method?: string;
    date_from?: string;
    date_to?: string;
  };
  categories: string[];
  paymentMethods: string[];
}

export default function ExpenseIndex({ expenses, filters, categories, paymentMethods }: Props) {
  const [search, setSearch] = useState(filters.search || '');

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      router.get('/expenses', { ...filters, search: value, page: 1 }, {
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

  const handleFilterChange = (key: string, value: string) => {
    const filterValue = value === 'all' ? undefined : value;
    router.get('/expenses', { ...filters, [key]: filterValue, page: 1 }, {
      preserveState: true,
    });
  };

  const handleDelete = (id: number) => {
    router.delete(`/expenses/${id}`, {
      preserveScroll: true,
    });
  };


  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Biaya Operasional" />
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Biaya Operasional</h1>
            <p className="text-muted-foreground mt-1">Catat dan pantau pengeluaran operasional toko.</p>
          </div>
          <Link href="/expenses/create">
            <Button className="w-full md:w-auto gap-2" size="lg">
              <Plus className="size-4" /> Catat Biaya Baru
            </Button>
          </Link>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col gap-4 bg-card p-4 rounded-xl border shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Cari deskripsi atau kategori..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="w-full md:w-[180px]">
                <Select value={filters.category || 'all'} onValueChange={(v) => handleFilterChange('category', v)}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Semua Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-[180px]">
                <Select value={filters.payment_method || 'all'} onValueChange={(v) => handleFilterChange('payment_method', v)}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Metode Bayar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Metode</SelectItem>
                    {paymentMethods.map((pm) => (
                      <SelectItem key={pm} value={pm}>{pm}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={filters.date_from || ''}
                  onChange={(e) => handleFilterChange('date_from', e.target.value)}
                  className="h-10 w-auto"
                />
                <Input
                  type="date"
                  value={filters.date_to || ''}
                  onChange={(e) => handleFilterChange('date_to', e.target.value)}
                  className="h-10 w-auto"
                />
              </div>
              {(filters.search || filters.category || filters.payment_method || filters.date_from || filters.date_to) && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 shrink-0"
                  onClick={() => {
                    setSearch('');
                    router.get('/expenses', {}, { preserveState: true });
                  }}
                >
                  <RotateCcw className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Expense List */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold">Tanggal</th>
                  <th className="px-6 py-4 font-semibold">Kategori \u0026 Deskripsi</th>
                  <th className="px-6 py-4 font-semibold text-right">Jumlah</th>
                  <th className="px-6 py-4 font-semibold">Metode</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {expenses.data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">
                      Tidak ada data pengeluaran ditemukan.
                    </td>
                  </tr>
                ) : (
                  expenses.data.map((expense) => (
                    <tr key={expense.id} className="hover:bg-muted/50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">
                            {dayjs(expense.expense_date).format('DD MMM YYYY')}
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase">
                            Catatan: {expense.creator?.name || 'System'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                             <Badge variant="secondary" className="px-2 py-0 text-[10px] uppercase font-bold">
                              {expense.category}
                            </Badge>
                          </div>
                          <span className="mt-1 font-semibold text-foreground">{expense.description}</span>
                          {expense.notes && <span className="text-xs text-muted-foreground italic">{expense.notes}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-destructive">
                        {formatCurrency(Number(expense.amount))}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {expense.payment_method === 'Cash' ? <Banknote className="size-3.5 text-green-500" /> : <CreditCard className="size-3.5 text-blue-500" />}
                          <span className="text-xs">{expense.payment_method}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          {expense.receipt_image && (
                            <a href={`/storage/${expense.receipt_image}`} target="_blank" rel="noreferrer">
                              <Button size="icon" variant="ghost" className="size-8 text-blue-500">
                                <ImageIcon className="size-3.5" />
                              </Button>
                            </a>
                          )}
                          <Link href={`/expenses/${expense.id}/edit`}>
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
                                <AlertDialogTitle>Hapus Data?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Data pengeluaran ini akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(expense.id)} className="bg-destructive hover:bg-destructive/90 text-white">
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

          {/* Pagination Section */}
          <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t bg-muted/30">
            <div className="text-xs text-muted-foreground whitespace-nowrap">
              Menampilkan <span className="font-bold text-foreground">{expenses.from || 0}</span> - <span className="font-bold text-foreground">{expenses.to || 0}</span> dari <span className="font-bold text-foreground">{expenses.total}</span> data
            </div>
            <div className="flex items-center gap-1">
              {expenses.links.map((link, i) => {
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
