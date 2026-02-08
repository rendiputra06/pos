import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { Minus, Plus, Search, ShoppingCart, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { PaymentModal } from './components/payment-modal';

interface Product {
    id: number;
    name: string;
    price: number;
    type: 'product' | 'service';
    sku?: string;
    stock?: number;
    unit?: string;
    price_levels?: any[];
}

interface CartItem extends Product {
    qty: number;
    subtotal: number;
    original_price: number; // for displaying discount/wholesale effect
}

export default function PosIndex({ serviceCategories }: { serviceCategories: any[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [showPayment, setShowPayment] = useState(false);

    // Dynamic Pricing Logic
    const calculateItemPrice = (item: Product, qty: number): number => {
        if (item.type === 'service' && item.price_levels && item.price_levels.length > 0) {
            const level = item.price_levels.find((l: any) => qty >= l.min_qty && (!l.max_qty || qty <= l.max_qty));
            return level ? Number(level.price) : Number(item.price);
        }
        return Number(item.price);
    };

    const addToCart = (product: Product) => {
        setCart((prev) => {
            const existing = prev.find((i) => i.id === product.id && i.type === product.type);
            if (existing) {
                const newQty = existing.qty + 1;
                const newPrice = calculateItemPrice(existing, newQty);
                return prev.map((i) =>
                    i.id === product.id && i.type === product.type
                        ? { ...i, qty: newQty, price: newPrice, subtotal: newQty * newPrice }
                        : i
                );
            }
            return [...prev, { ...product, qty: 1, original_price: product.price, subtotal: product.price }];
        });
        setSearchQuery('');
        setSearchResults([]);
        // Refocus the search input
        setTimeout(() => {
            const commandInput = document.querySelector('[cmdk-input]') as HTMLInputElement;
            if (commandInput) commandInput.focus();
        }, 100);
    };

    const updateQty = (index: number, delta: number) => {
        setCart((prev) => {
            const newCart = [...prev];
            const item = newCart[index];
            const newQty = Math.max(0, item.qty + delta); // Allow 0 to remove? Or keep min 1? Let's use remove button for removal.
            
            if (newQty === 0) return prev; // Don't allow 0 via minus button, use delete instead

            const newPrice = calculateItemPrice(item, newQty);
            newCart[index] = {
                ...item,
                qty: newQty,
                price: newPrice,
                subtotal: newQty * newPrice
            };
            return newCart;
        });
    };

    const updateManualQty = (index: number, val: string) => {
        const qty = parseFloat(val);
        if (isNaN(qty) || qty < 0) return;

        setCart((prev) => {
            const newCart = [...prev];
            const item = newCart[index];
            const newPrice = calculateItemPrice(item, qty);
            newCart[index] = {
                ...item,
                qty: qty,
                price: newPrice,
                subtotal: qty * newPrice
            };
            return newCart;
        });
    };

    const removeFromCart = (index: number) => {
        setCart((prev) => prev.filter((_, i) => i !== index));
    };

    const clearCart = () => setCart([]);

    // Barcode Scanner Listener
    useEffect(() => {
        let buffer = '';
        let timer: any;

        const handleScanner = (e: KeyboardEvent) => {
            // Ignore if active element is an input (unless it's the POS search)
            const active = document.activeElement;
            if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') && !active.hasAttribute('cmdk-input')) {
                return;
            }

            if (e.key === 'Enter') {
                if (buffer.length >= 3) {
                    processBarcode(buffer);
                }
                buffer = '';
                return;
            }

            if (e.key.length === 1) {
                buffer += e.key;
                clearTimeout(timer);
                timer = setTimeout(() => {
                    buffer = '';
                }, 200); // Reset buffer if slow typing (human)
            }
        };

        const processBarcode = async (barcode: string) => {
            try {
                const res = await axios.get(route('api.pos.search'), { params: { q: barcode } });
                const results = res.data;
                
                // If exact match found, add directly
                const exactMatch = results.find((r: any) => r.is_exact);
                if (exactMatch) {
                    addToCart(exactMatch);
                    toast.success(`${exactMatch.name} ditambahkan via scan`);
                } else if (results.length === 1) {
                    addToCart(results[0]);
                    toast.success(`${results[0].name} ditambahkan via scan`);
                }
            } catch (err) {
                console.error('Barcode processing error:', err);
            }
        };

        window.addEventListener('keydown', handleScanner);
        return () => window.removeEventListener('keydown', handleScanner);
    }, [cart]);

    // Search Effect - Handle auto-add if exact match
    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                const res = await axios.get(route('api.pos.search'), { params: { q: searchQuery } });
                const results = res.data;
                
                // Check if result has is_exact flag (Backend prioritized it)
                const exact = results.find((r: any) => r.is_exact);
                if (exact && results.length === 1) {
                    addToCart(exact);
                    setSearchQuery('');
                    setSearchResults([]);
                } else {
                    setSearchResults(results);
                }
            } catch (e) {
                console.error('Search error:', e);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                const commandInput = document.querySelector('[cmdk-input]') as HTMLInputElement;
                if (commandInput) commandInput.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const cartTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

    const handleProcessPayment = async (method: string, amount: number) => {
        try {
            const payload = {
                items: cart.map(i => ({ id: i.id, type: i.type, qty: i.qty, price: i.price })),
                total_amount: cartTotal,
                grand_total: cartTotal,
                payment_method: method,
                discount: 0,
            };

            const response = await axios.post(route('api.pos.store'), payload);
            toast.success('Transaksi berhasil!', { description: 'Struk sedang dicetak...' });
            
            // Open receipt in new window
            const transactionId = response.data.data.id;
            window.open(route('pos.receipt', transactionId), '_blank', 'width=400,height=600');

            setCart([]);
            setShowPayment(false);
        } catch (error) {
            console.error(error);
            toast.error('Gagal memproses transaksi.');
        }
    };

    const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

    return (
        <AppLayout breadcrumbs={[{ title: 'POS Terminal', href: '/pos' }]}>
            <Head title="Point of Sale" />
            
            <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
                {/* Left Panel: Shortcuts & Search */}
                <div className="flex-1 flex flex-col border-r bg-muted/30 p-4 gap-4">
                    {/* Search Bar */}
                    <div className="relative z-10">
                        <Command shouldFilter={false} className="rounded-lg border shadow-md">
                            <CommandInput 
                                placeholder="Cari nama barang, SKU, atau jasa... (Cmd+K)" 
                                value={searchQuery}
                                onValueChange={(value) => {
                                    console.log('Search query changed:', value);
                                    setSearchQuery(value);
                                }}
                            />
                            {searchResults.length > 0 && (
                                <CommandList className="absolute top-12 w-full bg-popover border rounded-md shadow-lg z-50 animate-in fade-in zoom-in-95">
                                    <CommandGroup heading="Hasil Pencarian">
                                        {searchResults.map((item) => (
                                            <CommandItem key={`${item.type}-${item.id}`} onSelect={() => addToCart(item)} className="cursor-pointer">
                                                <div className="flex justify-between w-full items-center">
                                                    <div>
                                                        <span className="font-medium">{item.name}</span>
                                                        <span className="ml-2 text-xs text-muted-foreground uppercase px-1.5 py-0.5 rounded bg-muted">
                                                            {item.type}
                                                        </span>
                                                        {item.type === 'product' && (
                                                            <span className={`ml-2 text-xs ${item.stock! < 5 ? 'text-red-500 font-bold' : 'text-green-600'}`}>
                                                                Stok: {item.stock}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="font-bold">{formatCurrency(item.price)}</span>
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            )}
                        </Command>
                    </div>

                    {/* Shortcuts Grid */}
                    <ScrollArea className="flex-1">
                        <div className="space-y-6">
                            {serviceCategories.map((cat) => (
                                <div key={cat.id}>
                                    <h3 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wider">{cat.name}</h3>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                        {cat.services.map((service: any) => (
                                            <button
                                                key={service.id}
                                                onClick={() => addToCart({ ...service, type: 'service', price: service.base_price, original_price: service.base_price })}
                                                className="flex flex-col items-start p-3 bg-card hover:bg-accent border rounded-xl shadow-sm hover:shadow-md transition-all text-left"
                                            >
                                                <span className="font-bold text-sm line-clamp-2 leading-tight">{service.name}</span>
                                                <span className="text-primary font-mono text-xs mt-1">{formatCurrency(service.base_price)}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Right Panel: Cart & Checkout */}
                <div className="w-[400px] flex flex-col bg-background shadow-xl z-20">
                    <div className="p-4 border-b flex justify-between items-center bg-card">
                        <div className="flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-primary" />
                            <h2 className="font-bold text-lg">Keranjang Belanja</h2>
                        </div>
                        <Button variant="ghost" size="sm" onClick={clearCart} disabled={cart.length === 0} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                            Clear
                        </Button>
                    </div>

                    <ScrollArea className="flex-1 p-4">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2 opacity-50">
                                <ShoppingCart className="w-12 h-12" />
                                <p>Keranjang kosong</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {cart.map((item, index) => (
                                    <div key={`${item.type}-${item.id}`} className="flex flex-col gap-2 p-3 rounded-lg border bg-card shadow-sm animate-in slide-in-from-right-4 duration-300">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-sm line-clamp-2">{item.name}</h4>
                                                {item.price < item.original_price && (
                                                    <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded">
                                                        Grosir Applied
                                                    </span>
                                                )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-muted-foreground hover:text-red-500 -mt-1 -mr-1"
                                                onClick={() => removeFromCart(index)}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        
                                        <div className="flex justify-between items-center mt-1">
                                            <div className="flex items-center gap-2 bg-muted rounded-md p-0.5">
                                                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-sm" onClick={() => updateQty(index, -1)}>
                                                    <Minus className="w-3 h-3" />
                                                </Button>
                                                <Input 
                                                    className="w-12 h-6 text-center text-xs p-0 border-none bg-transparent focus-visible:ring-0" 
                                                    value={item.qty}
                                                    onChange={(e) => updateManualQty(index, e.target.value)}
                                                />
                                                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-sm" onClick={() => updateQty(index, 1)}>
                                                    <Plus className="w-3 h-3" />
                                                </Button>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-sm">{formatCurrency(item.subtotal)}</div>
                                                <div className="text-[10px] text-muted-foreground">@{formatCurrency(item.price)}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>

                    <div className="p-4 bg-muted/50 border-t space-y-4">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>{formatCurrency(cartTotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Diskon</span>
                                <span>{formatCurrency(0)}</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span className="text-primary">{formatCurrency(cartTotal)}</span>
                            </div>
                        </div>

                        <Button 
                            className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20" 
                            disabled={cart.length === 0}
                            onClick={() => setShowPayment(true)}
                        >
                            Proses Pembayaran
                        </Button>
                    </div>
                </div>
            </div>

            <PaymentModal 
                open={showPayment} 
                onOpenChange={setShowPayment} 
                total={cartTotal} 
                onProcess={handleProcessPayment}
            />
        </AppLayout>
    );
}
