import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Package, 
  Edit, 
  Trash2, 
  QrCode, 
  Barcode, 
  Power,
  MoreVertical,
  AlertCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ProductVariant {
  id: number;
  sku: string;
  barcode?: string;
  price: number;
  cost_price: number;
  stock: number;
  unit: string;
  combination: Record<string, string>;
  formatted_combination: string;
  is_active: boolean;
  thumbnail_url?: string;
}

interface VariantCardProps {
  variant: ProductVariant;
  onEdit: (variantId: number) => void;
  onToggleStatus: (variantId: number) => void;
  onDelete: (variantId: number) => void;
  onGenerateBarcode: (variantId: number) => void;
  onViewBarcode: (variantId: number) => void;
  isLoading?: boolean;
}

export default function VariantCard({ 
  variant, 
  onEdit, 
  onToggleStatus, 
  onDelete, 
  onGenerateBarcode, 
  onViewBarcode,
  isLoading = false 
}: VariantCardProps) {
  const getStockStatus = (stock: number) => {
    if (stock === 0) return { color: 'bg-red-100 text-red-800', text: 'Habis', icon: AlertCircle };
    if (stock <= 10) return { color: 'bg-yellow-100 text-yellow-800', text: 'Rendah', icon: AlertCircle };
    return { color: 'bg-green-100 text-green-800', text: 'Tersedia', icon: null };
  };

  const stockStatus = getStockStatus(variant.stock);

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-md hover:shadow-lg/20">
      {/* Status Indicator */}
      <div className="absolute top-3 right-3 z-10">
        <div className={`h-3 w-3 rounded-full transition-all ${
          variant.is_active ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
        }`} />
      </div>

      <CardContent className="p-4">
        {/* Variant Image */}
        <div className="aspect-square w-20 overflow-hidden rounded-lg bg-muted mx-auto mb-4">
          {variant.thumbnail_url ? (
            <img
              src={variant.thumbnail_url}
              alt={variant.sku}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Variant Info */}
        <div className="space-y-2">
          <div className="text-center">
            <h3 className="font-semibold text-sm">{variant.sku}</h3>
            <p className="text-xs text-muted-foreground">{variant.formatted_combination}</p>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <Button
              variant={variant.is_active ? "default" : "secondary"}
              size="sm"
              onClick={() => onToggleStatus(variant.id)}
              className="h-6 px-2 text-xs"
              disabled={isLoading}
            >
              <Power className="mr-1 h-3 w-3" />
              {variant.is_active ? 'Active' : 'Inactive'}
            </Button>
          </div>

          {/* Pricing */}
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <span className="font-bold text-emerald-600 text-sm">
                Rp {Number(variant.price).toLocaleString('id-ID')}
              </span>
            </div>
            <div className="text-center">
              <span className="text-xs text-muted-foreground">
                Modal: Rp {Number(variant.cost_price).toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Stock Status */}
          <div className="flex flex-col items-center gap-1">
            <div className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${stockStatus.color}`}>
              {stockStatus.icon && <stockStatus.icon className="h-3 w-3" />}
              {stockStatus.text}: {variant.stock} {variant.unit}
            </div>
            
            {/* Stock Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all ${
                  variant.stock > 20 ? 'bg-green-500' : 
                  variant.stock > 5 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min((variant.stock / 50) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Barcode Info */}
          {variant.barcode && (
            <div className="text-center">
              <span className="text-xs text-muted-foreground font-mono">
                {variant.barcode}
              </span>
            </div>
          )}

          {/* Actions - Desktop */}
          <div className="hidden md:flex gap-1 justify-center pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(variant.id)}
              className="h-8 px-2"
              disabled={isLoading}
            >
              <Edit className="h-3 w-3" />
            </Button>
            {!variant.barcode && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onGenerateBarcode(variant.id)}
                className="h-8 px-2"
                disabled={isLoading}
              >
                <QrCode className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewBarcode(variant.id)}
              className="h-8 px-2"
              disabled={isLoading}
            >
              <Barcode className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(variant.id)}
              className="h-8 px-2 text-destructive hover:text-destructive"
              disabled={isLoading}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>

          {/* Actions - Mobile */}
          <div className="md:hidden flex justify-center pt-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 px-2">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                <DropdownMenuItem onClick={() => onEdit(variant.id)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleStatus(variant.id)}>
                  <Power className="mr-2 h-4 w-4" /> Toggle Status
                </DropdownMenuItem>
                {!variant.barcode && (
                  <DropdownMenuItem onClick={() => onGenerateBarcode(variant.id)}>
                    <QrCode className="mr-2 h-4 w-4" /> Generate Barcode
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onViewBarcode(variant.id)}>
                  <Barcode className="mr-2 h-4 w-4" /> View Barcode
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(variant.id)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
