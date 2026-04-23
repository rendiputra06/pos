import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UnitSelector } from './unit-selector';

const mockUnits = [
    {
        id: 1,
        name: 'pcs',
        price: 1000,
        stock: 100,
        sku: 'PROD-PCS',
        barcode: '1234567890123',
        conversion_factor: 1,
    },
    {
        id: 2,
        name: 'box',
        price: 9500,
        stock: 10,
        sku: 'PROD-BOX',
        barcode: '1234567890124',
        conversion_factor: 10,
    },
    {
        id: 3,
        name: 'dus',
        price: 45000,
        stock: 2,
        sku: 'PROD-DUS',
        conversion_factor: 50,
    },
];

const mockProduct = {
    id: 1,
    name: 'Test Product',
    units: mockUnits,
};

describe('UnitSelector', () => {
    it('renders nothing when product is null', () => {
        const { container } = render(
            <UnitSelector
                isOpen={true}
                onClose={vi.fn()}
                product={null}
                onSelect={vi.fn()}
            />
        );
        expect(container).toBeEmptyDOMElement();
    });

    it('renders dialog with product name and units', () => {
        render(
            <UnitSelector
                isOpen={true}
                onClose={vi.fn()}
                product={mockProduct}
                onSelect={vi.fn()}
            />
        );

        expect(screen.getByText('Pilih Satuan')).toBeInTheDocument();
        expect(screen.getByText('Test Product tersedia dalam beberapa satuan jual')).toBeInTheDocument();
        expect(screen.getByText('pcs')).toBeInTheDocument();
        expect(screen.getByText('box')).toBeInTheDocument();
        expect(screen.getByText('dus')).toBeInTheDocument();
    });

    it('displays correct prices for each unit', () => {
        render(
            <UnitSelector
                isOpen={true}
                onClose={vi.fn()}
                product={mockProduct}
                onSelect={vi.fn()}
            />
        );

        // Check for formatted prices
        expect(screen.getByText('Rp 1.000')).toBeInTheDocument();
        expect(screen.getByText('Rp 9.500')).toBeInTheDocument();
        expect(screen.getByText('Rp 45.000')).toBeInTheDocument();
    });

    it('displays stock information for each unit', () => {
        render(
            <UnitSelector
                isOpen={true}
                onClose={vi.fn()}
                product={mockProduct}
                onSelect={vi.fn()}
            />
        );

        // Check for stock text
        const stockElements = screen.getAllByText(/Stok:/);
        expect(stockElements).toHaveLength(3);

        // Check for specific stock values
        expect(screen.getByText('Stok: 100')).toBeInTheDocument();
        expect(screen.getByText('Stok: 10')).toBeInTheDocument();
        expect(screen.getByText('Stok: 2')).toBeInTheDocument();
    });

    it('shows low stock warning for items with stock <= 5', () => {
        render(
            <UnitSelector
                isOpen={true}
                onClose={vi.fn()}
                product={mockProduct}
                onSelect={vi.fn()}
            />
        );

        // Check for low stock styling (stock of 2 for 'dus' should show warning)
        const lowStockElement = screen.getByText('Stok: 2');
        expect(lowStockElement).toHaveClass('text-red-500');
    });

    it('displays SKU and barcode information', () => {
        render(
            <UnitSelector
                isOpen={true}
                onClose={vi.fn()}
                product={mockProduct}
                onSelect={vi.fn()}
            />
        );

        expect(screen.getByText('SKU: PROD-PCS')).toBeInTheDocument();
        expect(screen.getByText('SKU: PROD-BOX')).toBeInTheDocument();
        expect(screen.getByText('SKU: PROD-DUS')).toBeInTheDocument();
        expect(screen.getByText('Barcode: 1234567890123')).toBeInTheDocument();
        expect(screen.getByText('Barcode: 1234567890124')).toBeInTheDocument();
    });

    it('calls onSelect with correct unit when a unit is clicked', () => {
        const onSelect = vi.fn();
        render(
            <UnitSelector
                isOpen={true}
                onClose={vi.fn()}
                product={mockProduct}
                onSelect={onSelect}
            />
        );

        // Click on the box unit
        const boxButton = screen.getByText('box').closest('button');
        fireEvent.click(boxButton!);

        expect(onSelect).toHaveBeenCalledWith(mockUnits[1]);
        expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it('shows instruction text at the bottom', () => {
        render(
            <UnitSelector
                isOpen={true}
                onClose={vi.fn()}
                product={mockProduct}
                onSelect={vi.fn()}
            />
        );

        expect(screen.getByText('Klik satuan untuk menambahkan ke keranjang')).toBeInTheDocument();
    });
});
