import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

initializeTheme();

/**
 * Global Inertia interceptor to prefix all URLs with VITE_HTTP_BASE
 * Runs after createInertiaApp to ensure Inertia is fully initialized
 */
const httpBase = import.meta.env.VITE_HTTP_BASE;

if (httpBase && httpBase !== '') {
    const cleanBase = httpBase.replace(/\/+$/, '');

    const unsubscribe = router.on('before', (event) => {
        const url = event.detail.visit.url;

        // Handle both URL objects and strings
        if (url instanceof URL) {
            // Modify the pathname property directly
            if (url.pathname.startsWith('/') && !url.pathname.startsWith(cleanBase + '/')) {
                url.pathname = cleanBase + url.pathname;
            }
        } else {
            // Handle as string
            const urlString = String(url);
            if (urlString.startsWith('/') && !urlString.startsWith('http') && !urlString.startsWith(cleanBase + '/')) {
                // @ts-expect-error - Inertia accepts string at runtime
                event.detail.visit.url = cleanBase + urlString;
            }
        }
    });

    // Prevent tree-shaking by adding observable side effects
    // @ts-expect-error - Adding global property for debugging
    window.__INERTIA_BASE_PATH__ = cleanBase;
    // @ts-expect-error - Store unsubscribe function globally
    window.__INERTIA_UNSUBSCRIBE__ = unsubscribe;
}
