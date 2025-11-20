/**
 * Dashboard Shared Types
 *
 * Base TypeScript interfaces used across multiple dashboard components.
 * These provide a foundation for type-safe development.
 */

import type { ReactNode } from 'react';

// ============================================================================
// Filter Types
// ============================================================================

/**
 * Base filter values shared by dashboard filters (company/production center)
 */
export interface BaseFilterValues {
    companyId: number | null;
    productionCenterId: number | null;
}

/**
 * Date range filter values for dashboards with time-based filtering
 */
export interface DateRangeFilterValues {
    startDate: Date | null;
    endDate: Date | null;
}

// ============================================================================
// KPI and Metrics Types
// ============================================================================

/**
 * KPI (Key Performance Indicator) data for dashboard cards
 */
export interface KpiData {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    variant?: 'primary' | 'success' | 'warning' | 'info' | 'destructive' | 'default';
    description?: string;
    trend?: {
        value: number;
        label: string;
        direction: 'up' | 'down' | 'neutral';
    };
}

/**
 * General dashboard metrics
 */
export interface DashboardMetrics {
    label: string;
    value: number;
}

// ============================================================================
// Chart Data Types
// ============================================================================

/**
 * Pie/Donut chart data structure
 */
export interface PieChartData {
    name: string;
    value: number;
    color?: string;
}

/**
 * Gauge chart data for operability/failure indices
 */
export interface GaugeChartData {
    operabilityIndex: number;
    failureIndex?: number;
}

/**
 * Generic chart data point
 */
export interface ChartDataPoint {
    label: string;
    value: number;
    color?: string;
}

// ============================================================================
// Table and Data Grid Types
// ============================================================================

/**
 * Column definition for dashboard data tables
 */
export interface ColumnDefinition<T> {
    key: string;
    header: string;
    render?: (row: T) => ReactNode;
    sortable?: boolean;
    className?: string;
    nestedRows?: NestedRowDefinition<T>;
}

/**
 * Nested row configuration for expandable/hierarchical table rows
 */
export interface NestedRowDefinition<T> {
    getData: (row: T) => unknown[];
    columns: ColumnDefinition<unknown>[];
    expandable?: boolean;
    defaultExpanded?: boolean;
}

/**
 * Empty state configuration for tables
 */
export interface TableEmptyState {
    message: string;
    icon?: React.ComponentType<{ className?: string }>;
}

/**
 * Pagination information
 */
export interface PaginationInfo {
    currentPage: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

/**
 * Paginated data response
 */
export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationInfo;
}

// ============================================================================
// Component Configuration Types
// ============================================================================

/**
 * Dashboard card variant options
 */
export type DashboardCardVariant = 'default' | 'gradient' | 'muted';

/**
 * Padding size options for cards
 */
export type PaddingSize = 'sm' | 'md' | 'lg';

/**
 * Spacing size options
 */
export type SpacingSize = 'sm' | 'md' | 'lg';

/**
 * Chart size options
 */
export type ChartSize = 'sm' | 'md' | 'lg';

// ============================================================================
// Status and Badge Types
// ============================================================================
// Kept intentionally minimal for base template

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * Base props for dashboard layout components
 */
export interface DashboardComponentProps {
    className?: string;
    children?: ReactNode;
}

/**
 * Card variant with header
 */
export interface CardWithHeaderProps extends DashboardComponentProps {
    title?: string;
    description?: string;
    headerActions?: ReactNode;
    variant?: DashboardCardVariant;
    padding?: PaddingSize;
}
