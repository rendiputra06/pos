import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type BreadcrumbItem } from '@/types';
import { 
  ChevronLeft, 
  Save, 
  Loader2, 
  Plus, 
  Trash2, 
  Package, 
  HandHelping,
  FileDigit,
  CalendarDays,
  BadgeInfo
} from 'lucide-react';
import InputError from '@/components/input-error';
import { formatCurrency } from '@/lib/currency';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Stok Masuk', href: '/purchases' },
  { title: 'Catat Stok Masuk', href: '#' },
];

interface Supplier {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  sku: string;
  cost_price: string;
  unit: string;
}

interface Props {
  suppliers: Supplier[];
  products: Product[];
}

export default function PurchaseForm({ suppliers, products }: Props) {
  const [selectedProduct, setSelectedProduct] = useState<string>('');

  const { data, setData, post, processing, errors } = useForm({
    supplier_id: '',
    invoice_number: 'FK-' + new Date().getTime(),
    purchase_date: new Date().toISOString().split('T')[0],
    status: 'pending',
    notes: '',
    items: [] as { product_id: number; name: string; sku: string; qty: number; cost_price: number }[],
  });

  const addItem = () => {
    const product = products.find(p => p.id === Number(selectedProduct));
    if (!product) return;

    if (data.items.find(item => item.product_id === product.id)) {
        return; // Already added
    }

    setData('items', [
      ...data.items,
      {
        product_id: product.id,
        name: product.name,
        sku: product.sku,
        qty: 1,
        cost_price: Number(product.cost_price),
      }
    ]);
    setSelectedProduct('');
  };

  const removeItem = (id: number) => {
    setData('items', data.items.filter(item => item.product_id !== id));
  };

  const updateItem = (id: number, field: string, value: number) => {
    setData('items', data.items.map(item => {
      if (item.product_id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const calculateTotal = () => {
    return data.items.reduce((total, item) => total + (item.qty * item.cost_price), 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/purchases');
  };


  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Catat Stok Masuk" />
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/purchases">
            <Button variant="ghost" size="icon" className="size-10 rounded-full">
              <ChevronLeft className="size-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Catat Stok Masuk</h1>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-md border-2">
               <CardHeader className="bg-muted/30">
                  <CardTitle className="text-lg flex items-center gap-2">
                     <Package className="size-5 text-primary" /> Detail Item Barang
                  </CardTitle>
               </CardHeader>
               <CardContent className="pt-6 space-y-6">
                  <div className="flex flex-col md:flex-row gap-4">
                     <div className="flex-1">
                        <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                           <SelectTrigger className="h-11">
                              <SelectValue placeholder="Pilih Produk..." />
                           </SelectTrigger>
                           <SelectContent>
                              {products.map(p => (
                                 <SelectItem key={p.id} value={p.id.toString()}>
                                    {p.name} ({p.sku})
                                 </SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                     </div>
                     <Button type="button" onClick={addItem} disabled={!selectedProduct} className="gap-2 h-11 px-6">
                        <Plus className="size-4" /> Masukkan ke Daftar
                     </Button>
                  </div>

                  <div className="border rounded-xl overflow-hidden shadow-inner bg-card">
                     <table className="w-full text-sm">
                        <thead className="bg-muted text-xs font-bold uppercase tracking-wider text-muted-foreground">
                           <tr>
                              <th className="px-4 py-3 text-left">Produk</th>
                              <th className="px-4 py-3 text-center w-24">Jumlah</th>
                              <th className="px-4 py-3 text-right w-32">Harga Beli</th>
                              <th className="px-4 py-3 text-right w-32">Subtotal</th>
                              <th className="px-4 py-3 text-center w-12"></th>
                           </tr>
                        </thead>
                        <tbody className="divide-y">
                           {data.items.length === 0 ? (
                              <tr>
                                 <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground italic">
                                    Belum ada item ditambahkan.
                                 </td>
                              </tr>
                           ) : (
                              data.items.map((item) => (
                                 <tr key={item.product_id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-4 font-medium">
                                       <div className="text-sm">{item.name}</div>
                                       <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">SKU: {item.sku}</div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                       <Input 
                                          type="number" 
                                          className="h-9 w-20 mx-auto text-center font-bold"
                                          value={item.qty}
                                          onChange={(e) => updateItem(item.product_id, 'qty', Number(e.target.value))}
                                       />
                                    </td>
                                    <td className="px-4 py-4">
                                       <Input 
                                          type="number" 
                                          className="h-9 text-right font-bold w-32"
                                          value={item.cost_price}
                                          onChange={(e) => updateItem(item.product_id, 'cost_price', Number(e.target.value))}
                                       />
                                    </td>
                                    <td className="px-4 py-4 text-right font-bold text-primary">
                                       {formatCurrency(item.qty * item.cost_price)}
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                       <Button 
                                          type="button" 
                                          variant="ghost" 
                                          size="icon" 
                                          className="size-8 text-destructive hover:bg-destructive/10"
                                          onClick={() => removeItem(item.product_id)}
                                       >
                                          <Trash2 className="size-4" />
                                       </Button>
                                    </td>
                                 </tr>
                              ))
                           )}
                        </tbody>
                        {data.items.length > 0 && (
                           <tfoot className="bg-muted/50 font-bold border-t">
                              <tr>
                                 <td colSpan={3} className="px-4 py-4 text-right uppercase tracking-wider text-muted-foreground">Total Keseluruhan</td>
                                 <td className="px-4 py-4 text-right text-lg text-primary">{formatCurrency(calculateTotal())}</td>
                                 <td></td>
                              </tr>
                           </tfoot>
                        )}
                     </table>
                  </div>
                  <InputError message={errors.items} />
               </CardContent>
            </Card>

            <Card className="shadow-md border-2">
               <CardHeader className="bg-muted/30">
                  <CardTitle className="text-lg flex items-center gap-2">
                     <BadgeInfo className="size-5 text-primary" /> Catatan Tambahan
                  </CardTitle>
               </CardHeader>
               <CardContent className="pt-6">
                  <Textarea 
                     placeholder="Contoh: Barang dikirim via kurir, titipan untuk cabang B, dll..."
                     className="min-h-[100px] resize-none"
                     value={data.notes}
                     onChange={(e) => setData('notes', e.target.value)}
                  />
               </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-md border-2">
               <CardHeader className="bg-primary/5">
                  <CardTitle className="text-lg">Informasi Faktur</CardTitle>
               </CardHeader>
               <CardContent className="pt-6 space-y-4">
                  <div className="grid gap-2">
                     <Label className="font-semibold flex items-center gap-2">
                        <HandHelping className="size-4 text-primary" /> Supplier <span className="text-destructive">*</span>
                     </Label>
                     <Select value={data.supplier_id} onValueChange={(v) => setData('supplier_id', v)}>
                        <SelectTrigger className="h-11">
                           <SelectValue placeholder="Pilih Supplier..." />
                        </SelectTrigger>
                        <SelectContent>
                           {suppliers.map(s => (
                              <SelectItem key={s.id} value={s.id.toString()}>
                                 {s.name}
                              </SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                     <InputError message={errors.supplier_id} />
                  </div>

                  <div className="grid gap-2">
                     <Label className="font-semibold flex items-center gap-2">
                        <FileDigit className="size-4 text-primary" /> Nomor Faktur <span className="text-destructive">*</span>
                     </Label>
                     <Input 
                        value={data.invoice_number} 
                        className="h-11 font-mono uppercase"
                        onChange={(e) => setData('invoice_number', e.target.value)}
                     />
                     <InputError message={errors.invoice_number} />
                  </div>

                  <div className="grid gap-2">
                     <Label className="font-semibold flex items-center gap-2">
                        <CalendarDays className="size-4 text-primary" /> Tanggal Pembelian <span className="text-destructive">*</span>
                     </Label>
                     <Input 
                        type="date"
                        value={data.purchase_date} 
                        className="h-11"
                        onChange={(e) => setData('purchase_date', e.target.value)}
                     />
                     <InputError message={errors.purchase_date} />
                  </div>

                  <div className="grid gap-2">
                     <Label className="font-semibold flex items-center gap-2">
                        <BadgeInfo className="size-4 text-primary" /> Status Penerimaan <span className="text-destructive">*</span>
                     </Label>
                     <Select value={data.status} onValueChange={(v: 'pending' | 'received') => setData('status', v)}>
                        <SelectTrigger className="h-11">
                           <SelectValue placeholder="Pilih Status..." />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="pending">Pending (Belum Datang)</SelectItem>
                           <SelectItem value="received">Received (Stok Langsung Bertambah)</SelectItem>
                        </SelectContent>
                     </Select>
                     <InputError message={errors.status} />
                  </div>

                  <div className="pt-4">
                     <Button type="submit" disabled={processing} className="w-full h-12 gap-2 text-lg font-bold shadow-lg">
                        {processing ? <Loader2 className="size-5 animate-spin" /> : <Save className="size-5" />}
                        Simpan transaksi
                     </Button>
                     <p className="text-[10px] text-muted-foreground text-center mt-3 uppercase tracking-widest font-bold">Pastikan data sudah benar sebelum disimpan</p>
                  </div>
               </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
