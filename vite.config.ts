import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    // Configure base path for assets from VITE_ASSET_BASE env variable
    const rawBase = env.VITE_ASSET_BASE && env.VITE_ASSET_BASE.trim();
    let base: string | undefined;

    if (rawBase) {
        const hasProtocol = /^https?:\/\//i.test(rawBase);
        if (hasProtocol) {
            base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
        } else {
            const withLeading = rawBase.startsWith('/') ? rawBase : `/${rawBase}`;
            base = withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
        }
    }

    return {
    ...(base ? { base } : {}),

        optimizeDeps: {
            include: [
                '@emotion/react',
                '@emotion/styled',
                '@mui/material',
                '@mui/x-data-grid',
                '@mui/x-data-grid/locales',
                '@radix-ui/react-avatar',
                '@radix-ui/react-checkbox',
                '@radix-ui/react-collapsible',
                '@radix-ui/react-dialog',
                '@radix-ui/react-dropdown-menu',
                '@radix-ui/react-label',
                '@radix-ui/react-navigation-menu',
                '@radix-ui/react-select',
                '@radix-ui/react-separator',
                '@radix-ui/react-slot',
                '@radix-ui/react-toggle',
                '@radix-ui/react-toggle-group',
                '@radix-ui/react-tooltip',
                'lucide-react',
                'ziggy-js',
            ],
        },
        plugins: [
            laravel({
                input: ['resources/css/app.css', 'resources/js/app.tsx'],
                ssr: 'resources/js/ssr.tsx',
                refresh: true,
            }),
            react(),
            tailwindcss(),
            // Wayfinder disabled: types are generated in deploy.sh before starting Vite
            // This is necessary because Docker is not available inside the Vite container
            // wayfinder({
            //     formVariants: true,
            // }),
        ],
        esbuild: {
            jsx: 'automatic',
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'resources/js'),
            },
        },
        publicDir: 'public',
        server: {
            host: '0.0.0.0',
            cors: env.VITE_CORS_ALLOW_ALL === 'true',
            hmr:
                {
                    host: env.VITE_HMR_HOST || 'localhost',
                },

        },
    };
});
