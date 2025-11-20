import axios from 'axios';

/**
 * Configured axios instance with proper base URL for cPanel deployments.
 * This instance automatically prepends the VITE_HTTP_BASE path (e.g., /controlmantencion/)
 * to all API calls, ensuring compatibility with subdirectory deployments.
 */
const httpBase = import.meta.env.VITE_HTTP_BASE;
const baseURL = httpBase && httpBase !== '' ? httpBase.replace(/\/+$/, '') : '';

const api = axios.create({
    baseURL,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

/**
 * Builds a full URL with the proper base path for cPanel deployments.
 * Use this function for file downloads (PDFs, Excel) and window.location.href redirects.
 *
 * @param path - The relative path (e.g., "/dashboard/export/pdf")
 * @returns The full URL with base path prepended
 *
 * @example
 * buildUrl("/dashboard/export/pdf?id=1")
 * // Returns: "/controlmantencion/dashboard/export/pdf?id=1" (in cPanel)
 * // Returns: "/dashboard/export/pdf?id=1" (in local dev)
 */
export function buildUrl(path: string): string {
    if (!path) return '';

    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    // If no base URL, return the path as-is
    if (!baseURL) return `/${cleanPath}`;

    // Combine base URL with path
    return `${baseURL}/${cleanPath}`;
}

export default api;
