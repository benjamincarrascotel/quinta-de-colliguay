/**
 * Dashboard Color Mappings and Palettes
 *
 * Centralized color mappings for status badges and chart palettes.
 * Each status can be mapped to a badge variant or chart color.
 */

import { Badge } from '@/components/ui/badge';
import type { ComponentProps } from 'react';

type BadgeVariant = ComponentProps<typeof Badge>['variant'];

export type StatusVariantMap = Record<string, BadgeVariant | 'success' | 'warning'>;

export const DEFAULT_STATUS_MAP: StatusVariantMap = {
    active: 'secondary',
    inactive: 'outline',
    pending: 'warning',
};

/**
 * Chart Color Palette
 * Uses CSS variables for theme-aware colors
 */
export const CHART_COLORS = {
    success: 'hsl(var(--color-success))',
    operational: 'hsl(var(--color-success))', // alias for success
    failure: 'hsl(var(--color-failure))',
    warning: 'hsl(var(--color-warning))',
    alert: 'hsl(var(--color-alert))',
    info: 'hsl(var(--color-info))',
    primary: 'hsl(var(--color-primary))',
    muted: 'hsl(var(--color-muted-foreground))',

    // Chart series colors
    chart1: 'hsl(var(--color-chart-1))',
    chart2: 'hsl(var(--color-chart-2))',
    chart3: 'hsl(var(--color-chart-3))',
    chart4: 'hsl(var(--color-chart-4))',
    chart5: 'hsl(var(--color-chart-5))',
} as const;

/**
 * Gauge Chart Colors
 * Specific colors for gauge visualizations
 */
export const GAUGE_COLORS = {
    operational: 'hsl(var(--color-success))',
    failure: 'hsl(var(--color-failure))',
    background: 'hsl(var(--color-gauge-background))',
} as const;

/**
 * Get status variant for a given status code
 * Provides default 'secondary' variant if status not found
 */
export const getStatusVariant = (statusCode: string, statusMap: StatusVariantMap): BadgeVariant | 'success' | 'warning' => {
    return statusMap[statusCode] || 'secondary';
};

/**
 * Get status label - can be extended to support i18n
 * For now, returns the status code formatted
 */
export const getStatusLabel = (statusCode: string): string => {
    return statusCode
        .replace(/_/g, ' ')
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};
