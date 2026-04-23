import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ChevronLeft, Package } from 'lucide-react';
import React, { useState } from 'react';
import ProductTypeSelector from '@/components/products/ProductTypeSelector';
import ProductBasicInfo from '@/components/products/ProductBasicInfo';
import MultiUnitTable from '@/components/products/MultiUnitTable';
import ProductImageUpload from '@/components/products/ProductImageUpload';
import ProductFinanceStock from '@/components/products/ProductFinanceStock';
import ProductPreview from '@/components/products/ProductPreview';
import ProductSaveActions from '@/components/products/ProductSaveActions';

interface Category {
    id: number;
    name: string;
}

interface Product {
    id: number;
    category_id: number;
    name: string;
    sku: string;
    barcode: string | null;
    cost_price: number;
    price: number;
    stock: number;
    unit: string;
    has_variants: boolean;
    has_multiple_units?: boolean;
    thumbnail_url?: string | null;
    medium_url?: string | null;
    original_url?: string | null;
    units?: ProductUnit[];
}

interface ProductUnit {
    id?: number;
    name: string;
    sku: string;
    barcode: string | null;
    price: number;
    cost_price: number;
    stock: number;
    conversion_factor: number;
    is_base_unit: boolean;
    is_active?: boolean;
}

interface Props {
    product?: Product;
    categories: Category[];
}

const generateSKU = (productName: string, unitName: string, index: number): string => {
    const cleanName = productName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 8);
    const cleanUnit = unitName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 4);
    return `${cleanName}-${cleanUnit}-${String(index + 1).padStart(2, '0')}`;
};

const commonUnits = [
    'pcs', 'buah', 'pack', 'box', 'rim', 'dus',
    'meter', 'cm', 'roll', 'lembar', 'set',
    'lusin', 'kodi', 'gross', 'bottle', 'can'
];

export default function ProductForm({ product, categories }: Props) {
    const isEdit = !!product;
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [hasVariants, setHasVariants] = useState(product?.has_variants || false);
    const [hasMultipleUnits, setHasMultipleUnits] = useState(product?.has_multiple_units || false);
    const [isUnitsExpanded, setIsUnitsExpanded] = useState(true);
    const [isImageExpanded, setIsImageExpanded] = useState(true);
    const [isFinanceExpanded, setIsFinanceExpanded] = useState(true);
    const [skuValidation, setSkuValidation] = useState<{ valid: boolean; message?: string }>({ valid: true });
    const [barcodeValidation, setBarcodeValidation] = useState<{ valid: boolean; message?: string }>({ valid: true });
    const [customUnit, setCustomUnit] = useState('');

    // Initialize units from product or with default single unit
    const initialUnits: ProductUnit[] = product?.units?.length
        ? product.units.map((u, i) => ({
            ...u,
            is_base_unit: u.is_base_unit ?? (i === 0),
        }))
        : hasMultipleUnits
            ? []
            : [];

    const [units, setUnits] = useState<ProductUnit[]>(initialUnits);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Data Produk', href: '/products' },
        { title: isEdit ? 'Edit Produk' : 'Tambah Produk', href: '#' },
    ];

    const { data, setData, post, put, processing, errors } = useForm({
        category_id: product?.category_id.toString() || '',
        name: product?.name || '',
        sku: product?.sku || '',
        barcode: product?.barcode || '',
        cost_price: product?.cost_price || 0,
        price: product?.price || 0,
        stock: product?.stock || 0,
        unit: product?.unit || 'pcs',
        has_variants: product?.has_variants || false,
        has_multiple_units: product?.has_multiple_units || false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        Object.keys(data).forEach((key) => {
            const value = data[key as keyof typeof data];

            // Handle boolean values properly
            if (key === 'has_variants' || key === 'has_multiple_units') {
                formData.append(key, value ? '1' : '0');
            } else {
                formData.append(key, value.toString());
            }
        });

        // Add units data if has_multiple_units
        if (hasMultipleUnits && units.length > 0) {
            formData.append('units', JSON.stringify(units));
        }

        if (imageFile) {
            formData.append('image', imageFile);
        }

        if (isEdit) {
            formData.append('_method', 'PUT');
            router.post(`/products/${product.id}`, formData);
        } else {
            router.post('/products', formData);
        }
    };

    const handleImageChange = (file: File | null) => {
        setImageFile(file);
    };

    const handleImageRemove = () => {
        setImageFile(null);
        if (isEdit && product) {
            router.delete(`/products/${product.id}/image`);
        }
    };

    const handleSaveAndInputVariants = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        Object.keys(data).forEach((key) => {
            const value = data[key as keyof typeof data];

            // Handle boolean values properly
            if (key === 'has_variants' || key === 'has_multiple_units') {
                formData.append(key, value ? '1' : '0');
            } else {
                formData.append(key, value.toString());
            }
        });

        // Add units data if has_multiple_units
        if (hasMultipleUnits && units.length > 0) {
            formData.append('units', JSON.stringify(units));
        }

        if (imageFile) {
            formData.append('image', imageFile);
        }

        // Add redirect parameter
        formData.append('redirect_to_variants', '1');

        // Submit form and let controller handle redirect
        router.post('/products', formData);
    };

    // Unit management functions
    const addUnit = () => {
        const isFirst = units.length === 0;
        const newUnit: ProductUnit = {
            name: '',
            sku: data.name ? generateSKU(data.name, 'UNIT', units.length) : '',
            barcode: null,
            price: 0,
            cost_price: 0,
            stock: isFirst ? (data.stock || 0) : 0,
            conversion_factor: isFirst ? 1 : 1,
            is_base_unit: isFirst,
        };
        setUnits([...units, newUnit]);
    };

    const removeUnit = (index: number) => {
        const newUnits = units.filter((_, i) => i !== index);
        // If we removed the base unit, make the first remaining unit the base
        if (units[index].is_base_unit && newUnits.length > 0) {
            newUnits[0].is_base_unit = true;
        }
        setUnits(newUnits);
    };

    const updateUnit = (index: number, field: keyof ProductUnit, value: string | number | boolean) => {
        const newUnits = [...units];
        newUnits[index] = { ...newUnits[index], [field]: value };

        // If setting this unit as base unit, unset all others
        if (field === 'is_base_unit' && value === true) {
            newUnits.forEach((u, i) => {
                if (i !== index) u.is_base_unit = false;
            });
            // Base unit holds the stock
            newUnits[index].stock = data.stock || 0;
        }

        setUnits(newUnits);
    };

    const toggleMultipleUnits = (checked: boolean) => {
        setHasMultipleUnits(checked);
        setData('has_multiple_units', checked);

        if (checked) {
            // Switching to multi-unit mode - initialize with base unit
            if (units.length === 0) {
                setUnits([{
                    name: data.unit || 'pcs',
                    sku: data.sku || generateSKU(data.name || 'PROD', 'PCS', 0),
                    barcode: data.barcode || null,
                    price: data.price || 0,
                    cost_price: data.cost_price || 0,
                    stock: data.stock || 0,
                    conversion_factor: 1,
                    is_base_unit: true,
                }]);
            }
            setIsUnitsExpanded(true);
        } else {
            // Switching to single unit mode - update product fields from base unit
            const baseUnit = units.find(u => u.is_base_unit) || units[0];
            if (baseUnit) {
                setData('unit', baseUnit.name);
                setData('price', baseUnit.price);
                setData('cost_price', baseUnit.cost_price);
                setData('stock', baseUnit.stock);
            }
            setUnits([]);
        }
    };

    const generateMainSKU = () => {
        const newSku = generateSKU(data.name || 'PROD', data.unit || 'PCS', 0);
        setData('sku', newSku);
    };

    const validateSKU = (value: string) => {
        if (!value) {
            setSkuValidation({ valid: true });
            return;
        }
        // Simple validation - in real app, check against database
        if (value.length < 3) {
            setSkuValidation({ valid: false, message: 'SKU minimal 3 karakter' });
        } else {
            setSkuValidation({ valid: true });
        }
    };

    const validateBarcode = (value: string) => {
        if (!value) {
            setBarcodeValidation({ valid: true });
            return;
        }
        // Simple validation - in real app, check against database
        if (value.length < 8) {
            setBarcodeValidation({ valid: false, message: 'Barcode minimal 8 karakter' });
        } else {
            setBarcodeValidation({ valid: true });
        }
    };

    const handleNameChange = (value: string) => {
        setData('name', value);
        // Auto-generate SKU if name is provided and SKU is empty
        if (value && !data.sku) {
            const newSku = generateSKU(value, data.unit || 'PCS', 0);
            setData('sku', newSku);
        }
    };

    const handleSaveAndAddAnother = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        Object.keys(data).forEach((key) => {
            const value = data[key as keyof typeof data];

            if (key === 'has_variants' || key === 'has_multiple_units') {
                formData.append(key, value ? '1' : '0');
            } else {
                formData.append(key, value.toString());
            }
        });

        if (hasMultipleUnits && units.length > 0) {
            formData.append('units', JSON.stringify(units));
        }

        if (imageFile) {
            formData.append('image', imageFile);
        }

        formData.append('redirect_to_create', '1');

        router.post('/products', formData);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Edit Produk' : 'Tambah Produk'} />
            <div className="mx-auto max-w-5xl space-y-6 p-6">
                <div className="flex items-center gap-4">
                    <Link href="/products">
                        <Button variant="ghost" size="icon" className="size-10 rounded-full">
                            <ChevronLeft className="size-5" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">{isEdit ? 'Ubah Data Produk' : 'Input Produk Baru'}</h1>
                </div>

                <ProductTypeSelector
                    hasVariants={hasVariants}
                    hasMultipleUnits={hasMultipleUnits}
                    onSimpleSelect={() => {
                        setHasVariants(false);
                        setHasMultipleUnits(false);
                        setData('has_variants', false);
                        setData('has_multiple_units', false);
                    }}
                    onMultiUnitSelect={() => {
                        if (!hasVariants) toggleMultipleUnits(true);
                    }}
                    onVariantSelect={() => {
                        setHasVariants(true);
                        setData('has_variants', true);
                        setHasMultipleUnits(false);
                        setData('has_multiple_units', false);
                    }}
                />

                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Detail Produk
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ProductBasicInfo
                                    name={data.name}
                                    sku={data.sku}
                                    barcode={data.barcode}
                                    categoryId={data.category_id}
                                    unit={data.unit}
                                    hasMultipleUnits={hasMultipleUnits}
                                    hasVariants={hasVariants}
                                    categories={categories}
                                    skuValidation={skuValidation}
                                    barcodeValidation={barcodeValidation}
                                    customUnit={customUnit}
                                    commonUnits={commonUnits}
                                    errors={errors}
                                    onNameChange={handleNameChange}
                                    onSkuChange={(value) => {
                                        setData('sku', value);
                                        validateSKU(value);
                                    }}
                                    onBarcodeChange={(value) => {
                                        setData('barcode', value);
                                        validateBarcode(value);
                                    }}
                                    onCategoryIdChange={(value) => setData('category_id', value)}
                                    onUnitChange={(value) => {
                                        if (value === 'custom') {
                                            setData('unit', customUnit);
                                        } else {
                                            setData('unit', value);
                                        }
                                    }}
                                    onCustomUnitChange={(value) => {
                                        setCustomUnit(value);
                                        setData('unit', value);
                                    }}
                                    onGenerateSku={generateMainSKU}
                                />
                            </CardContent>
                        </Card>

                        {hasMultipleUnits && !hasVariants && (
                            <MultiUnitTable
                                units={units}
                                isExpanded={isUnitsExpanded}
                                onToggleExpanded={() => setIsUnitsExpanded(!isUnitsExpanded)}
                                onAddUnit={addUnit}
                                onRemoveUnit={removeUnit}
                                onUpdateUnit={updateUnit}
                                customUnit={customUnit}
                                commonUnits={commonUnits}
                                onCustomUnitChange={setCustomUnit}
                            />
                        )}

                        <ProductImageUpload
                            imageUrl={imageFile ? URL.createObjectURL(imageFile) : product?.original_url || null}
                            onImageChange={handleImageChange}
                            onImageRemove={handleImageRemove}
                            disabled={processing}
                            isExpanded={isImageExpanded}
                            onToggleExpanded={() => setIsImageExpanded(!isImageExpanded)}
                        />

                        <ProductFinanceStock
                            costPrice={data.cost_price}
                            price={data.price}
                            stock={data.stock}
                            hasVariants={hasVariants}
                            hasMultipleUnits={hasMultipleUnits}
                            isExpanded={isFinanceExpanded}
                            onToggleExpanded={() => setIsFinanceExpanded(!isFinanceExpanded)}
                            onCostPriceChange={(value) => setData('cost_price', value)}
                            onPriceChange={(value) => setData('price', value)}
                            onStockChange={(value) => setData('stock', value)}
                            errors={errors}
                        />
                    </div>

                    <div className="space-y-6">
                        <ProductSaveActions
                            processing={processing}
                            isEdit={isEdit}
                            hasVariants={hasVariants}
                            productId={product?.id}
                            onSave={handleSubmit}
                            onSaveAndInputVariants={handleSaveAndInputVariants}
                            onSaveAndAddAnother={handleSaveAndAddAnother}
                            onManageVariants={() => router.visit(`/products/${product?.id}/variants`)}
                        />

                        <ProductPreview
                            name={data.name}
                            sku={data.sku}
                            hasVariants={hasVariants}
                            hasMultipleUnits={hasMultipleUnits}
                            price={data.price}
                            stock={data.stock}
                        />
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
