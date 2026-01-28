import React, { useRef } from 'react';
import { useForm, Link, Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BreadcrumbItem } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Save, X, Image as ImageIcon, Banknote, Calendar } from 'lucide-react';
import dayjs from 'dayjs';

interface Expense {
  id?: number;
  category: string;
  description: string;
  amount: number | string;
  expense_date: string;
  payment_method: string;
  receipt_image: string | null;
  notes: string | null;
}

interface Props {
  expense?: Expense;
  categories: string[];
  paymentMethods: string[];
}

export default function ExpenseForm({ expense, categories, paymentMethods }: Props) {
  const isEdit = !!expense;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, setData, post, processing, errors } = useForm({
    category: expense?.category || '',
    description: expense?.description || '',
    amount: expense?.amount || '',
    expense_date: expense?.expense_date ? dayjs(expense.expense_date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
    payment_method: expense?.payment_method || 'Cash',
    receipt_image: null as File | null,
    notes: expense?.notes || '',
    _method: isEdit ? 'PUT' : 'POST', // For multipart form with PUT
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      post(`/expenses/${expense.id}`, {
        forceFormData: true,
      });
    } else {
      post('/expenses');
    }
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Biaya Operasional', href: '/expenses' },
    { title: isEdit ? 'Ubah Catatan' : 'Catat Baru', href: '#' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={isEdit ? 'Ubah Biaya Operasional' : 'Catat Biaya Operasional'} />
      <div className="p-6">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {isEdit ? 'Ubah Catatan Biaya' : 'Catat Biaya Operasional Baru'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {isEdit ? 'Perbarui detail pengeluaran operasional.' : 'Masukkan rincian pengeluaran untuk dicatat dalam laporan keuangan.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Form */}
            <Card className="md:col-span-2 shadow-sm border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="size-5 text-primary" /> Informasi Pengeluaran
                </CardTitle>
                <CardDescription>Detail utama pengeluaran operasional.</CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Kategori <span className="text-destructive">*</span></Label>
                    <Select value={data.category} onValueChange={(v) => setData('category', v)}>
                      <SelectTrigger id="category" className={errors.category ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Pilih Kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                        <SelectItem value="Other">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expense_date">Tanggal <span className="text-destructive">*</span></Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="expense_date"
                        type="date"
                        value={data.expense_date}
                        className={`pl-10 ${errors.expense_date ? 'border-destructive' : ''}`}
                        onChange={(e) => setData('expense_date', e.target.value)}
                      />
                    </div>
                    {errors.expense_date && <p className="text-xs text-destructive">{errors.expense_date}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi / Nama Biaya <span className="text-destructive">*</span></Label>
                  <Input
                    id="description"
                    placeholder="Contoh: Bayar Listrik Bulan Januari"
                    value={data.description}
                    className={errors.description ? 'border-destructive' : ''}
                    onChange={(e) => setData('description', e.target.value)}
                  />
                  {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Jumlah (IDR) <span className="text-destructive">*</span></Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">Rp</span>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0"
                        value={data.amount}
                        className={`pl-10 font-bold ${errors.amount ? 'border-destructive' : ''} text-lg`}
                        onChange={(e) => setData('amount', e.target.value)}
                      />
                    </div>
                    {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payment_method">Metode Pembayaran <span className="text-destructive">*</span></Label>
                    <Select value={data.payment_method} onValueChange={(v) => setData('payment_method', v)}>
                      <SelectTrigger id="payment_method" className={errors.payment_method ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Pilih Metode" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((pm) => (
                           <SelectItem key={pm} value={pm}>
                             <div className="flex items-center gap-2">
                               {pm === 'Cash' ? <Banknote className="size-4 text-green-500" /> : <CreditCard className="size-4 text-blue-500" />}
                               {pm}
                             </div>
                           </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.payment_method && <p className="text-xs text-destructive">{errors.payment_method}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan Tambahan</Label>
                  <Textarea
                    id="notes"
                    placeholder="Info tambahan (opsional)..."
                    value={data.notes || ''}
                    rows={3}
                    onChange={(e) => setData('notes', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Sidebar Form */}
            <div className="space-y-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ImageIcon className="size-4 text-primary" /> Bukti Pembayaran
                  </CardTitle>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors aspect-square flex flex-col items-center justify-center gap-2"
                  >
                    {data.receipt_image ? (
                        <div className="relative w-full h-full">
                           <img 
                            src={URL.createObjectURL(data.receipt_image)} 
                            className="w-full h-full object-contain rounded-lg" 
                            alt="Receipt preview" 
                           />
                           <Button 
                            type="button" 
                            variant="destructive" 
                            size="icon" 
                            className="absolute -top-2 -right-2 size-6"
                            onClick={(e) => {
                                e.stopPropagation();
                                setData('receipt_image', null);
                            }}
                           >
                              <X className="size-3" />
                           </Button>
                        </div>
                    ) : expense?.receipt_image ? (
                        <div className="relative w-full h-full text-center">
                           <img 
                            src={`/storage/${expense.receipt_image}`} 
                            className="w-full h-full object-contain rounded-lg opacity-50" 
                            alt="Existing receipt" 
                           />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs font-bold uppercase p-1 bg-black/50 text-white rounded">Ganti Gambar</span>
                            </div>
                        </div>
                    ) : (
                      <>
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <ImageIcon className="size-5 text-primary" />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <p className="font-semibold text-primary">Klik untuk upload</p>
                          <p>PNG, JPG up to 2MB</p>
                        </div>
                      </>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => setData('receipt_image', e.target.files?.[0] || null)}
                    />
                  </div>
                  {errors.receipt_image && <p className="text-xs text-destructive mt-2 text-center">{errors.receipt_image}</p>}
                </CardContent>
              </Card>

              <div className="flex flex-col gap-3">
                <Button 
                    type="submit" 
                    disabled={processing} 
                    className="w-full h-12 shadow-md gap-2 text-lg font-bold"
                >
                    <Save className="size-5" />
                    {isEdit ? 'Simpan Perubahan' : 'Catat Sekarang'}
                </Button>
                <Link href="/expenses" className="w-full">
                  <Button type="button" variant="outline" className="w-full">
                    Batal
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
