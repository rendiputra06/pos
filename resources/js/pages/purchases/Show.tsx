import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type BreadcrumbItem } from '@/types';
import { 
  ChevronLeft, 
  Printer, 
  Calendar, 
  User, 
  HandHelping, 
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Package
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Stok Masuk', href: '/purchases' },
  { title: 'Detail Transaksi', href: '#' },
];

interface PurchaseDetail {
  id: number;
  product: {
    name: string;
    sku: string;
    unit: string;
  };
  qty: string;
  cost_price: string;
  subtotal: string;
}

interface Purchase {
  id: number;
  invoice_number: string;
  purchase_date: string;
  total_amount: string;
  status: 'pending' | 'received' | 'canceled';
  notes: string | null;
  supplier: {
    name: string;
    phone: string | null;
    address: string | null;
  };
  creator: {
    name: string;
  };
  details: PurchaseDetail[];
}

interface Props {
  purchase: Purchase;
}

export default function PurchaseShow({ purchase }: Props) {
  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(amount));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'received':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none gap-1 font-bold h-7 px-3"><CheckCircle2 className="size-4" /> Barang Diterima</Badge>;
      case 'canceled':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none gap-1 font-bold h-7 px-3"><XCircle className="size-4" /> Dibatalkan</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none gap-1 font-bold h-7 px-3"><Clock className="size-4" /> Menunggu Kedatangan</Badge>;
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Detail Faktur ${purchase.invoice_number}`} />
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/purchases">
              <Button variant="ghost" size="icon" className="size-10 rounded-full">
                <ChevronLeft className="size-5" />
              </Button>
            </Link>
            <div>
               <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                 <FileText className="size-7 text-primary" /> Detail Transaksi
               </h1>
               <p className="text-muted-foreground mt-1">Nomor Faktur: <span className="font-mono font-bold text-foreground">{purchase.invoice_number}</span></p>
            </div>
          </div>
          <Button variant="outline" onClick={() => window.print()} className="gap-2">
             <Printer className="size-4" /> Cetak Detail
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-1">
           <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-md border-2">
                 <CardHeader className="bg-muted/30 border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                       <Package className="size-5 text-primary" /> Daftar Item
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-0">
                    <table className="w-full text-sm">
                       <thead className="bg-muted/50 text-xs font-bold uppercase text-muted-foreground">
                          <tr>
                             <th className="px-6 py-4 text-left">Produk</th>
                             <th className="px-6 py-4 text-center">Qty</th>
                             <th className="px-6 py-4 text-right">Harga Beli</th>
                             <th className="px-6 py-4 text-right">Subtotal</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y">
                          {purchase.details.map((detail) => (
                             <tr key={detail.id} className="hover:bg-muted/20 transition-colors">
                                <td className="px-6 py-4">
                                   <div className="font-bold text-foreground">{detail.product.name}</div>
                                   <div className="text-[10px] uppercase font-bold text-muted-foreground font-mono">SKU: {detail.product.sku}</div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                   <div className="font-bold">{detail.qty} <span className="text-[10px] text-muted-foreground uppercase">{detail.product.unit}</span></div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                   {formatCurrency(detail.cost_price)}
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-primary">
                                   {formatCurrency(detail.subtotal)}
                                </td>
                             </tr>
                          ))}
                       </tbody>
                       <tfoot className="bg-muted/10 font-bold border-t">
                          <tr>
                             <td colSpan={3} className="px-6 py-6 text-right uppercase tracking-widest text-xs text-muted-foreground">Total Keseluruhan</td>
                             <td className="px-6 py-6 text-right text-xl text-primary">{formatCurrency(purchase.total_amount)}</td>
                          </tr>
                       </tfoot>
                    </table>
                 </CardContent>
              </Card>

              {purchase.notes && (
                 <Card className="shadow-md border-2">
                    <CardHeader className="bg-muted/30 border-b">
                       <CardTitle className="text-lg">Catatan</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                       <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{purchase.notes}</p>
                    </CardContent>
                 </Card>
              )}
           </div>

           <div className="space-y-6">
              <Card className="shadow-md border-2">
                 <CardHeader className="bg-primary/5 border-b">
                    <CardTitle className="text-lg">Informasi Pengiriman</CardTitle>
                 </CardHeader>
                 <CardContent className="pt-6 space-y-6">
                    <div className="space-y-4">
                       <div className="flex border-b pb-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                             <HandHelping className="size-5 text-primary" />
                          </div>
                          <div className="ml-4">
                             <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Supplier</div>
                             <div className="font-bold text-foreground">{purchase.supplier.name}</div>
                             {purchase.supplier.phone && <div className="text-xs text-muted-foreground">{purchase.supplier.phone}</div>}
                          </div>
                       </div>

                       <div className="flex border-b pb-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                             <Calendar className="size-5 text-primary" />
                          </div>
                          <div className="ml-4">
                             <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tanggal Pembelian</div>
                             <div className="font-bold text-foreground">{new Date(purchase.purchase_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                          </div>
                       </div>

                       <div className="flex border-b pb-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                             <User className="size-5 text-primary" />
                          </div>
                          <div className="ml-4">
                             <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Dicatat Oleh</div>
                             <div className="font-bold text-foreground">{purchase.creator.name}</div>
                          </div>
                       </div>
                    </div>

                    <div className="pt-4 space-y-3">
                       <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Status Transaksi</div>
                       {getStatusBadge(purchase.status)}
                    </div>
                 </CardContent>
              </Card>
           </div>
        </div>
      </div>
    </AppLayout>
  );
}
