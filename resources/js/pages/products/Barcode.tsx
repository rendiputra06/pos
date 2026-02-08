import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Printer, LayoutGrid, Tag, Minimize2, Maximize2, List } from 'lucide-react';
import Barcode from 'react-barcode';
import { Card, CardContent } from '@/components/ui/card';

interface Product {
  id: number;
  name: string;
  sku: string;
  barcode: string | null;
  price: string;
}

interface Props {
  product: Product;
}

type Variation = 'standard' | 'minimalist' | 'retail' | 'compact' | 'shelf';

export default function ProductBarcode({ product }: Props) {
  const [variation, setVariation] = useState<Variation>('standard');

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(amount));
  };

  const barcodeValue = product.barcode || product.sku;

  const variations: { id: Variation; name: string; icon: any; description: string }[] = [
    { id: 'standard', name: 'Standard', icon: LayoutGrid, description: 'Lengkap dengan nama toko & SKU' },
    { id: 'minimalist', name: 'Minimalis', icon: Minimize2, description: 'Hanya Barcode & Harga (Irit kertas)' },
    { id: 'retail', name: 'Retail', icon: Tag, description: 'Nama Produk + Barcode + Harga' },
    { id: 'compact', name: 'Compact', icon: List, description: 'Ukuran kecil untuk barang mini' },
    { id: 'shelf', name: 'Label Rak', icon: Maximize2, description: 'Harga besar untuk dipasang di rak' },
  ];

  const renderLabel = () => {
    switch (variation) {
      case 'minimalist':
        return (
          <div className="bg-white p-2 text-center w-[80mm] flex flex-col items-center justify-center space-y-2">
            <Barcode value={barcodeValue} width={2} height={40} fontSize={12} margin={0} />
            <div className="text-xl font-black text-black">{formatCurrency(product.price)}</div>
          </div>
        );
      
      case 'retail':
        return (
          <div className="bg-white p-4 text-center w-[80mm] space-y-3">
             <div className="text-xs font-bold uppercase line-clamp-1">{product.name}</div>
             <div className="flex justify-center border-y py-2 border-slate-100">
                <Barcode value={barcodeValue} width={1.8} height={50} fontSize={10} margin={0} />
             </div>
             <div className="text-xl font-black text-primary">{formatCurrency(product.price)}</div>
          </div>
        );

      case 'compact':
        return (
          <div className="bg-white p-1 text-center w-[50mm] space-y-1">
             <div className="text-[10px] font-bold truncate px-2">{product.name}</div>
             <div className="flex justify-center scale-90 origin-top">
                <Barcode value={barcodeValue} width={1.2} height={35} fontSize={8} margin={0} />
             </div>
             <div className="text-sm font-black text-black">{formatCurrency(product.price)}</div>
          </div>
        );

      case 'shelf':
        return (
          <div className="bg-white p-4 text-left w-[80mm] space-y-4 border-l-8 border-primary">
             <div className="space-y-1">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Nama Produk</div>
                <div className="text-sm font-black uppercase leading-tight line-clamp-2 h-10">{product.name}</div>
             </div>
             <div className="flex items-end justify-between gap-2">
                <div className="text-3xl font-black text-primary tracking-tighter">
                   {formatCurrency(product.price)}
                </div>
                <div className="scale-75 origin-bottom-right">
                   <Barcode value={barcodeValue} width={1} height={30} fontSize={8} margin={0} />
                </div>
             </div>
          </div>
        );

      default: // standard
        return (
          <div className="bg-white p-6 border-2 border-dashed border-slate-300 rounded-lg shadow-sm print:shadow-none print:border-none print:p-4 text-center space-y-4 w-[80mm]">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">POS HERO ATK</div>
            
            <div className="space-y-1">
               <h2 className="text-sm font-bold uppercase line-clamp-2 leading-tight">{product.name}</h2>
               <p className="text-[10px] font-mono font-bold text-slate-400">{product.sku}</p>
            </div>

            <div className="py-2 border-y border-slate-100 flex justify-center overflow-hidden">
               <Barcode 
                  value={barcodeValue} 
                  width={1.5} 
                  height={50} 
                  fontSize={10}
                  margin={0}
                  background="transparent"
               />
            </div>

            <div className="pt-2">
               <div className="text-2xl font-black text-primary">
                  {formatCurrency(product.price)}
               </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 print:bg-white print:p-0">
      <Head title={`Cetak Barcode - ${product.name}`} />
      
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8 print:block">
        {/* Sidebar Controls */}
        <div className="lg:col-span-1 space-y-6 print:hidden">
          <Link href="/products">
            <Button variant="ghost" className="gap-2 mb-2">
               <ChevronLeft className="size-4" /> Kembali
            </Button>
          </Link>
          
          <div className="space-y-4">
             <h3 className="font-bold text-lg px-1">Pilih Variasi Label</h3>
             {variations.map((v) => (
                <Card 
                  key={v.id} 
                  className={`cursor-pointer transition-all hover:border-primary/50 ${variation === v.id ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'bg-card'}`}
                  onClick={() => setVariation(v.id)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                     <div className={`p-2 rounded-lg ${variation === v.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                        <v.icon className="size-5" />
                     </div>
                     <div>
                        <div className="font-bold text-sm">{v.name}</div>
                        <div className="text-[10px] text-muted-foreground leading-none mt-1">{v.description}</div>
                     </div>
                  </CardContent>
                </Card>
             ))}
          </div>

          <Button onClick={() => window.print()} className="w-full h-12 gap-2 text-lg font-bold shadow-lg mt-4">
            <Printer className="size-5" /> Cetak Sekarang
          </Button>
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-3 flex flex-col items-center justify-center min-h-[60vh] print:min-h-0 bg-white lg:bg-slate-200/50 rounded-3xl border print:border-none print:bg-white p-8">
           <div className="mb-8 print:hidden text-center space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Live Preview</span>
              <h4 className="text-slate-500 text-xs italic">Cek tampilan label sebelum dicetak ke printer thermal</h4>
           </div>

           <div className="print:m-0 drop-shadow-2xl print:drop-shadow-none">
              {renderLabel()}
           </div>

           <div className="mt-12 text-center text-xs text-slate-400 print:hidden max-w-sm">
             {variation === 'compact' ? (
                <p>Variasi ini dioptimalkan untuk ukuran kertas <strong>50mm x 30/40mm</strong>.</p>
             ) : (
                <p>Variasi ini dioptimalkan untuk ukuran kertas thermal <strong>80mm</strong>.</p>
             )}
              <p className="mt-2">Gunakan pengaturan "Fit to page" atau atur skala ke 100% pada dialog print untuk hasil maksimal.</p>
           </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            margin: 0;
            size: ${variation === 'compact' ? '50mm 40mm' : '80mm 60mm'};
          }
          body {
            margin: 0;
            padding: 0;
          }
        }
      `}} />
    </div>
  );
}
