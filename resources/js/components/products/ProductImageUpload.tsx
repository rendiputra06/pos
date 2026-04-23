import ImageUpload from '@/components/ImageUpload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

interface ProductImageUploadProps {
    imageUrl: string | null;
    onImageChange: (file: File | null) => void;
    onImageRemove: () => void;
    disabled: boolean;
    isExpanded: boolean;
    onToggleExpanded: () => void;
}

export default function ProductImageUpload({
    imageUrl,
    onImageChange,
    onImageRemove,
    disabled,
    isExpanded,
    onToggleExpanded,
}: ProductImageUploadProps) {
    return (
        <Card className="shadow-sm">
            <Collapsible open={isExpanded} onOpenChange={onToggleExpanded}>
                <CardHeader>
                    <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between cursor-pointer">
                            <CardTitle>Gambar Produk</CardTitle>
                            <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                    </CollapsibleTrigger>
                    <CardDescription>Upload gambar produk untuk tampilan yang lebih menarik.</CardDescription>
                </CardHeader>
                <CollapsibleContent>
                    <CardContent>
                        <ImageUpload
                            value={imageUrl}
                            onChange={onImageChange}
                            onRemove={onImageRemove}
                            disabled={disabled}
                            className="max-w-xs"
                        />
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}
