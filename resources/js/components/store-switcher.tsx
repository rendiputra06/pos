import React from 'react';
import { router, usePage } from '@inertiajs/react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Store, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StoreSwitcher() {
    const { auth, stores } = usePage().props as any;
    const currentStore = auth.store;

    // If no stores available but user has a current store, show it
    if ((!stores || stores.length === 0) && currentStore) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground">
                <Store className="size-4" />
                <span>{currentStore.name}</span>
            </div>
        );
    }

    // If no stores and no current store, don't show switcher
    if ((!stores || stores.length === 0) && !currentStore) {
        return null;
    }

    const handleSwitch = (storeId: number) => {
        router.post(route('stores.switch'), { store_id: storeId }, {
            preserveScroll: true,
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2 px-3 lg:flex hidden border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
                    <Store className="size-4 text-primary" />
                    <span className="max-w-[120px] truncate text-xs font-semibold">
                        {currentStore?.name || 'Pilih Toko'}
                    </span>
                    <ChevronDown className="size-3.5 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
                <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground tracking-wider">Ganti Toko Aktif</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {stores.map((store: any) => (
                    <DropdownMenuItem 
                        key={store.id} 
                        onClick={() => handleSwitch(store.id)}
                        className="flex items-center justify-between cursor-pointer"
                    >
                        <span className={cn(
                            "truncate",
                            currentStore?.id === store.id ? "font-bold text-primary" : ""
                        )}>
                            {store.name}
                        </span>
                        {currentStore?.id === store.id && <Check className="size-4 text-primary" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function MobileStoreSwitcher() {
    const { auth, stores } = usePage().props as any;
    const currentStore = auth.store;

    // If no stores available but user has a current store, show it
    if ((!stores || stores.length === 0) && currentStore) {
        return (
            <div className="space-y-2 px-4 py-2 border-t mt-auto">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Toko Aktif</p>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground">
                    <Store className="size-4" />
                    <span className="truncate font-medium">{currentStore.name}</span>
                </div>
            </div>
        );
    }

    // If no stores and no current store, don't show switcher
    if ((!stores || stores.length === 0) && !currentStore) {
        return null;
    }

    const handleSwitch = (storeId: number) => {
        router.post(route('stores.switch'), { store_id: storeId });
    };

    return (
        <div className="space-y-2 px-4 py-2 border-t mt-auto">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Toko Aktif</p>
            <div className="grid grid-cols-1 gap-1">
                {stores.map((store: any) => (
                    <button
                        key={store.id}
                        onClick={() => handleSwitch(store.id)}
                        className={cn(
                            "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                            currentStore?.id === store.id 
                                ? "bg-primary text-primary-foreground font-bold shadow-md" 
                                : "hover:bg-muted text-muted-foreground"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <Store className="size-4" />
                            <span className="truncate">{store.name}</span>
                        </div>
                        {currentStore?.id === store.id && <Check className="size-4" />}
                    </button>
                ))}
            </div>
        </div>
    );
}
