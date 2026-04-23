import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Package, 
  Edit, 
  Trash2, 
  QrCode, 
  Barcode, 
  Power,
  MoreVertical,
  Upload,
  Camera,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency } from '@/lib/currency';
import { router } from '@inertiajs/react';

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
  productId: number;
  isSelected?: boolean;
  onToggleSelection?: () => void;
  onEdit: (variantId: number) => void;
  onToggleStatus: (variantId: number) => void;
  onDelete: (variantId: number) => void;
  onGenerateBarcode: (variantId: number) => void;
  onViewBarcode: (variantId: number) => void;
  isLoading?: boolean;
}

export default function VariantCard({ 
  variant, 
  productId,
  isSelected = false,
  onToggleSelection,
  onEdit, 
  onToggleStatus, 
  onDelete, 
  onGenerateBarcode, 
  onViewBarcode,
  isLoading = false 
}: VariantCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(variant.thumbnail_url || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { color: 'bg-red-100 text-red-800', text: 'Habis' };
    if (stock <= 10) return { color: 'bg-yellow-100 text-yellow-800', text: 'Rendah' };
    return { color: 'bg-green-100 text-green-800', text: 'Tersedia' };
  };

  const stockStatus = getStockStatus(variant.stock);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/') && file.size <= 2 * 1024 * 1024) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/') && file.size <= 2 * 1024 * 1024) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = () => {
    if (!imageFile) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', imageFile);
    router.post(`/products/${productId}/variants/${variant.id}/image`, formData, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        setImageFile(null);
        router.reload();
      },
      onFinish: () => setIsUploading(false),
    });
  };

  const handleRemoveImage = () => {
    if (variant.thumbnail_url) {
      router.delete(`/products/${productId}/variants/${variant.id}/image`, {
        preserveScroll: true,
        onSuccess: () => {
          setPreview(null);
          setImageFile(null);
          router.reload();
        },
      });
    } else {
      setPreview(null);
      setImageFile(null);
    }
  };

  return (
    <Card className={`group relative overflow-hidden transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      {/* Selection Checkbox */}
      {onToggleSelection && (
        <div className="absolute top-2 left-2 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggleSelection}
            className="bg-white border-2"
          />
        </div>
      )}

      {/* Status Indicator */}
      <div className="absolute top-2 right-2 z-10">
        <div className={`h-2.5 w-2.5 rounded-full ${variant.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
      </div>

      <CardContent className="p-3">
        {/* Variant Image with Upload */}
        <div className="relative mb-3">
          <div
            className={`aspect-square w-full overflow-hidden rounded-lg bg-muted cursor-pointer ${
              isDragging ? 'ring-2 ring-primary' : ''
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => !variant.thumbnail_url && !imageFile && fileInputRef.current?.click()}
          >
            {preview ? (
              <img
                src={preview}
                alt={variant.sku}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1">
                <Package className="h-6 w-6 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Klik untuk upload</span>
              </div>
            )}
          </div>
          <input type="file" ref={fileInputRef} accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />

          {/* Image overlay actions */}
          {preview && (
            <div className="absolute inset-0 flex items-center justify-center gap-1 rounded-lg bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              {imageFile ? (
                <>
                  <Button size="sm" onClick={handleUpload} disabled={isUploading} className="h-7 gap-1 text-xs">
                    <Upload className="h-3 w-3" />
                    {isUploading ? '...' : 'Upload'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setPreview(variant.thumbnail_url || null); setImageFile(null); }} className="h-7 gap-1 text-xs">
                    <X className="h-3 w-3" />
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="h-7 gap-1 text-xs">
                    <Camera className="h-3 w-3" />
                    Ganti
                  </Button>
                  {variant.thumbnail_url && (
                    <Button variant="destructive" size="sm" onClick={handleRemoveImage} className="h-7 gap-1 text-xs">
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Variant Info */}
        <div className="space-y-1.5">
          <div className="text-center">
            <h3 className="font-semibold text-sm leading-tight">{variant.formatted_combination}</h3>
            <p className="text-[10px] text-muted-foreground font-mono">{variant.sku}</p>
          </div>

          {/* Pricing */}
          <div className="text-center">
            <span className="font-bold text-emerald-600 text-sm">{formatCurrency(variant.price)}</span>
            <div className="text-[10px] text-muted-foreground">Modal: {formatCurrency(variant.cost_price)}</div>
          </div>

          {/* Stock Status */}
          <div className="flex justify-center">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${stockStatus.color}`}>
              {stockStatus.text}: {variant.stock} {variant.unit}
            </span>
          </div>

          {/* Actions */}
          <div className="flex justify-center pt-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                <DropdownMenuItem onClick={() => onEdit(variant.id)} disabled={isLoading}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleStatus(variant.id)} disabled={isLoading}>
                  <Power className="mr-2 h-4 w-4" />
                  {variant.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onViewBarcode(variant.id)} disabled={isLoading}>
                  <Barcode className="mr-2 h-4 w-4" /> Lihat Barcode
                </DropdownMenuItem>
                {!variant.barcode && (
                  <DropdownMenuItem onClick={() => onGenerateBarcode(variant.id)} disabled={isLoading}>
                    <QrCode className="mr-2 h-4 w-4" /> Generate Barcode
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDelete(variant.id)} className="text-destructive" disabled={isLoading}>
                  <Trash2 className="mr-2 h-4 w-4" /> Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
