import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Image as ImageIcon, Loader2, Upload, X } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface ImageUploadProps {
    value?: string | null;
    onChange: (file: File | null) => void;
    onRemove: () => void;
    disabled?: boolean;
    className?: string;
}

export default function ImageUpload({ value, onChange, onRemove, disabled = false, className }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const file = acceptedFiles[0];
            if (file) {
                setErrorMessage(null);
                if (file.size > 2 * 1024 * 1024) {
                    setErrorMessage('File size must be less than 2MB');
                    return;
                }

                if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                    setErrorMessage('Only JPEG, PNG, and WebP images are allowed');
                    return;
                }

                onChange(file);
            }
        },
        [onChange],
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
        },
        maxFiles: 1,
        disabled: disabled || uploading,
    });

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        onRemove();
    };

    if (value) {
        return (
            <div className={cn('group relative', className)}>
                <Card className="overflow-hidden">
                    <CardContent className="p-0">
                        <div className="relative mx-auto aspect-square w-full max-w-xs">
                            <img src={value} alt="Product image" className="h-full w-full object-cover" />
                            {!disabled && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
                                    onClick={handleRemove}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className={cn('w-full', className)}>
            <Card className="border-muted-foreground/25 hover:border-muted-foreground/50 border-2 border-dashed transition-colors">
                <CardContent className="p-6">
                    <div
                        {...getRootProps()}
                        className={cn(
                            'cursor-pointer text-center',
                            (isDragActive || uploading) && 'opacity-75',
                            disabled && 'cursor-not-allowed opacity-50',
                        )}
                    >
                        <input {...getInputProps()} />

                        <div className="flex flex-col items-center justify-center space-y-4">
                            {uploading ? (
                                <>
                                    <Loader2 className="text-muted-foreground h-12 w-12 animate-spin" />
                                    <div className="w-full max-w-xs space-y-2">
                                        <p className="text-muted-foreground text-sm">Uploading image...</p>
                                        <Progress value={uploadProgress} className="w-full" />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="bg-muted rounded-full p-4">
                                        {isDragActive ? (
                                            <Upload className="text-primary h-8 w-8" />
                                        ) : (
                                            <ImageIcon className="text-muted-foreground h-8 w-8" />
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">
                                            {isDragActive ? 'Drop the image here' : 'Click to upload or drag and drop'}
                                        </p>
                                        <p className="text-muted-foreground text-xs">PNG, JPG, WebP up to 2MB</p>
                                    </div>
                                    {!isDragActive && (
                                        <Button type="button" variant="outline" size="sm" disabled={disabled}>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Choose File
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                        {errorMessage && (
                            <div className="border-destructive/30 bg-destructive/10 text-destructive mt-4 rounded-md border p-3 text-sm">
                                {errorMessage}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
