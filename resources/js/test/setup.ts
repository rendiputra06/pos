import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.route for Inertia.js
Object.defineProperty(window, 'route', {
    value: vi.fn((name: string, params?: any) => {
        if (params) {
            return `/${name.replace('.', '/')}/${params}`;
        }
        return `/${name.replace('.', '/')}`;
    }),
    writable: true,
});

// Mock window.Laravel for Ziggy
Object.defineProperty(window, 'Laravel', {
    value: {
        ziggy: {
            url: 'http://localhost',
            port: null,
            defaults: {},
            routes: {},
        },
    },
    writable: true,
});
