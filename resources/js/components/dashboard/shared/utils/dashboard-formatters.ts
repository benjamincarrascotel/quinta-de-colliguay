/**
 * Dashboard Formatters
 *
 * Utility functions for formatting data displayed in dashboard components.
 * Handles dates, numbers, percentages, hours, and empty values.
 */

/**
 * Format a date or date string
 * @param date - Date object or ISO date string
 * @param includeTime - Whether to include time in output
 * @returns Formatted date string (es-CL locale)
 */
export const formatDate = (date: string | Date | null | undefined, includeTime = false): string => {
    if (!date) return '—';

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Check if date is valid
    if (isNaN(dateObj.getTime())) return '—';

    return dateObj.toLocaleString('es-CL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        ...(includeTime && {
            hour: '2-digit',
            minute: '2-digit',
            second: undefined,
        }),
    });
};

/**
 * Format a date without slashes (DDMMYYYY)
 * @param date - Date object or ISO date string
 * @returns Formatted date string
 */
export const formatDateCompact = (date: string | Date | null | undefined): string => {
    if (!date) return '—';

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) return '—';

    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();

    return `${day}/${month}/${year}`;
};

/**
 * Format a number with thousands separator
 * @param num - Number to format
 * @param decimals - Number of decimal places
 * @returns Formatted number string
 */
export const formatNumber = (num: number | null | undefined, decimals = 0): string => {
    if (num === null || num === undefined) return '—';

    return new Intl.NumberFormat('es-CL', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(num);
};

/**
 * Format a percentage value
 * @param value - Numeric percentage (0-100)
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string (e.g., "95.5%")
 */
export const formatPercentage = (value: number | null | undefined, decimals = 1): string => {
    if (value === null || value === undefined) return '—';

    return `${formatNumber(value, decimals)}%`;
};

/**
 * Format minutes to HH:MM format
 * @param minutes - Total minutes
 * @returns Formatted time string (e.g., "2:30")
 */
export const formatHours = (minutes: number | null | undefined): string => {
    if (minutes === null || minutes === undefined) return '—';

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Format duration in seconds to HH:MM:SS
 * @param seconds - Total seconds
 * @returns Formatted duration string
 */
export const formatDuration = (seconds: number | null | undefined): string => {
    if (seconds === null || seconds === undefined) return '—';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Handle empty or null values with placeholder
 * @param value - Any value
 * @param placeholder - Default text if value is empty
 * @returns Value or placeholder
 */
export const emptyValue = <T>(value: T, placeholder: string = '—'): T | string => {
    if (value === null || value === undefined || value === '') {
        return placeholder;
    }
    return value;
};

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string | null | undefined, maxLength: number = 50): string => {
    if (!text) return '—';

    if (text.length <= maxLength) {
        return text;
    }

    return text.substring(0, maxLength) + '...';
};

/**
 * Format a time range (from-to)
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Formatted date range
 */
export const formatDateRange = (startDate: string | Date | null | undefined, endDate: string | Date | null | undefined): string => {
    const start = formatDate(startDate);
    const end = formatDate(endDate);

    if (start === '—' || end === '—') return '—';

    return `${start} - ${end}`;
};

/**
 * Format a machine identifier (usually "name (code)")
 * @param name - Machine/Component name
 * @param identifier - Unique identifier or code
 * @returns Formatted identifier
 */
export const formatIdentifier = (name: string | null | undefined, identifier: string | null | undefined): string => {
    if (!name) return '—';

    if (identifier) {
        return `${name} (${identifier})`;
    }

    return name;
};
