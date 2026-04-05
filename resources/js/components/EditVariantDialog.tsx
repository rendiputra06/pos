import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const variantEditSchema = z.object({
    price: z.coerce.number().min(0, 'Harga jual harus >= 0'),
    cost_price: z.coerce.number().min(0, 'Harga modal harus >= 0'),
    stock: z.coerce.number().min(0, 'Stok tidak boleh negatif'),
});

interface ProductVariant {
    id: number;
    sku: string;
    price: number;
    cost_price: number;
    stock: number;
    formatted_combination: string;
    is_active: boolean;
}

interface EditVariantDialogProps {
    variant: ProductVariant | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (variantId: number, data: z.infer<typeof variantEditSchema>) => void;
    isLoading?: boolean;
}

export default function EditVariantDialog({ variant, isOpen, onClose, onSave, isLoading = false }: EditVariantDialogProps) {
    const form = useForm<z.infer<typeof variantEditSchema>>({
        resolver: zodResolver(variantEditSchema),
        defaultValues: {
            price: variant?.price || 0,
            cost_price: variant?.cost_price || 0,
            stock: variant?.stock || 0,
        },
    });

    React.useEffect(() => {
        if (variant) {
            form.reset({
                price: variant.price,
                cost_price: variant.cost_price,
                stock: variant.stock,
            });
        }
    }, [variant, form]);

    const onSubmit = (data: z.infer<typeof variantEditSchema>) => {
        if (variant) {
            onSave(variant.id, data);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Edit Variant
                        {variant && (
                            <span className="text-muted-foreground text-sm font-normal">
                                {variant.sku} - {variant.formatted_combination}
                            </span>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Harga Jual</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="number" placeholder="0" className="font-bold text-emerald-600" disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="cost_price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Harga Modal</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="number" placeholder="0" className="text-muted-foreground" disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="stock"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Stok</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="number" placeholder="0" disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                                Batal
                            </Button>
                            <Button type="button" onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Simpan'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
