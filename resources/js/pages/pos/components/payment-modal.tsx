import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Loader2, Printer, QrCode } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PaymentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    total: number;
    onProcess: (method: 'cash' | 'qris' | 'bank_transfer', amount: number) => Promise<void>;
}

export function PaymentModal({ open, onOpenChange, total, onProcess }: PaymentModalProps) {
    const [method, setMethod] = useState<'cash' | 'qris' | 'bank_transfer'>('cash');
    const [cashAmount, setCashAmount] = useState<string>('');
    const [processing, setProcessing] = useState(false);
    const [change, setChange] = useState<number | null>(null);

    const quickAmounts = [10000, 20000, 50000, 100000];

    useEffect(() => {
        if (open) {
            setCashAmount('');
            setChange(null);
            setProcessing(false);
            setMethod('cash');
        }
    }, [open]);

    const handleCashInput = (value: string) => {
        setCashAmount(value);
        const amount = parseFloat(value);
        if (!isNaN(amount) && amount >= total) {
            setChange(amount - total);
        } else {
            setChange(null);
        }
    };

    const handleSubmit = async () => {
        setProcessing(true);
        try {
            await onProcess(method, method === 'cash' ? parseFloat(cashAmount) : total);
        } catch (error) {
            console.error(error);
        } finally {
            setProcessing(false);
        }
    };

    const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Pembayaran</DialogTitle>
                    <DialogDescription>
                        Total Tagihan: <span className="font-bold text-lg text-primary">{formatCurrency(total)}</span>
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="cash" onValueChange={(v: string) => setMethod(v as any)} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="cash">Tunai</TabsTrigger>
                        <TabsTrigger value="qris">QRIS</TabsTrigger>
                        <TabsTrigger value="bank_transfer">Transfer</TabsTrigger>
                    </TabsList>

                    <TabsContent value="cash" className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>Nominal Uang Diterima</Label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={cashAmount}
                                onChange={(e) => handleCashInput(e.target.value)}
                                className="text-right text-lg font-bold"
                                autoFocus
                            />
                        </div>
                        
                        <div className="grid grid-cols-4 gap-2">
                            {quickAmounts.map((amt) => (
                                <Button
                                    key={amt}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCashInput(amt.toString())}
                                    className="text-xs"
                                >
                                    {amt / 1000}k
                                </Button>
                            ))}
                            <Button variant="outline" size="sm" onClick={() => handleCashInput(total.toString())} className="text-xs bg-primary/10 text-primary border-primary/20">
                                Pas
                            </Button>
                        </div>

                        {change !== null && (
                            <div className="p-4 bg-green-50 rounded-lg border border-green-100 text-center animate-in fade-in slide-in-from-bottom-2">
                                <span className="text-sm text-green-600 block mb-1">Kembalian</span>
                                <span className="text-2xl font-bold text-green-700">{formatCurrency(change)}</span>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="qris" className="pt-4 flex flex-col items-center justify-center space-y-4">
                        <div className="bg-white p-4 rounded-xl border shadow-sm">
                            <QrCode className="w-32 h-32 text-gray-800" />
                        </div>
                        <p className="text-sm text-center text-muted-foreground">Scan QRIS pelanggan untuk pembayaran otomatis (Simulasi)</p>
                    </TabsContent>

                    <TabsContent value="bank_transfer" className="pt-4">
                         <div className="p-4 rounded-lg bg-gray-50 border text-center text-muted-foreground text-sm">
                            Metode Transfer Bank manual.
                         </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={processing || (method === 'cash' && (!cashAmount || parseFloat(cashAmount) < total))} 
                        className="w-full h-12 text-lg"
                    >
                        {processing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Printer className="w-5 h-5 mr-2" />}
                        {processing ? 'Memproses...' : 'Bayar & Cetak Struk'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
