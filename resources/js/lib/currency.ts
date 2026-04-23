/**
 * Utility functions for currency formatting
 * Standardized IDR (Indonesian Rupiah) formatting across the application
 */

interface FormatCurrencyOptions {
    showSymbol?: boolean;
    fractionDigits?: number;
}

/**
 * Format a number as Indonesian Rupiah currency
 * @param value - The number to format
 * @param options - Formatting options
 * @returns Formatted currency string
 * 
 * @example
 * formatCurrency(10000) // "Rp 10.000"
 * formatCurrency(1500000) // "Rp 1.500.000"
 * formatCurrency(undefined) // "Rp 0"
 * formatCurrency(10000, { showSymbol: false }) // "10.000"
 */
export const formatCurrency = (
    value: number | undefined | null,
    options: FormatCurrencyOptions = {}
): string => {
    const { showSymbol = true, fractionDigits = 0 } = options;

    const numValue = Number(value ?? 0);

    return new Intl.NumberFormat('id-ID', {
        style: showSymbol ? 'currency' : 'decimal',
        currency: 'IDR',
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    }).format(numValue);
};

/**
 * Format a number as compact currency (with suffix like jt, M)
 * Useful for displaying large numbers in limited space
 * @param value - The number to format
 * @returns Compact formatted currency string
 * 
 * @example
 * formatCompactCurrency(1500000) // "Rp 1,5jt"
 * formatCompactCurrency(2500000000) // "Rp 2,5M"
 * formatCompactCurrency(50000) // "Rp 50.000"
 */
export const formatCompactCurrency = (value: number | undefined | null): string => {
    const num = Number(value ?? 0);

    if (num >= 1_000_000_000) {
        return `Rp ${(num / 1_000_000_000).toLocaleString('id-ID', {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
        })}M`;
    }

    if (num >= 1_000_000) {
        return `Rp ${(num / 1_000_000).toLocaleString('id-ID', {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
        })}jt`;
    }

    return formatCurrency(num);
};

/**
 * Format a number as decimal without currency symbol
 * @param value - The number to format
 * @param fractionDigits - Number of decimal places
 * @returns Formatted decimal string
 * 
 * @example
 * formatDecimal(10000.50, 2) // "10.000,50"
 */
export const formatDecimal = (
    value: number | undefined | null,
    fractionDigits = 0
): string => {
    return formatCurrency(value, { showSymbol: false, fractionDigits });
};

/**
 * Parse a formatted currency string back to number
 * @param value - The formatted string
 * @returns The numeric value
 * 
 * @example
 * parseCurrency("Rp 10.000") // 10000
 * parseCurrency("1.500.000") // 1500000
 */
export const parseCurrency = (value: string): number => {
    // Remove currency symbol, dots (thousand separators), and replace comma with dot for decimal
    const cleaned = value
        .replace(/Rp\s?/g, '')
        .replace(/\./g, '')
        .replace(/,/g, '.');

    return Number(cleaned) || 0;
};
