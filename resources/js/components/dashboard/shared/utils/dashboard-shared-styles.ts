/**
 * Dashboard Shared Styles and Constants
 *
 * Centralized constants for spacing, padding, grid layouts, and other
 * style properties used across dashboard components.
 */

// Spacing Constants - Use for vertical spacing between elements
export const DASHBOARD_SPACING = {
    sm: 'space-y-4', // Standard spacing (16px)
    md: 'space-y-6', // Medium spacing (24px) - for larger sections
    lg: 'space-y-8', // Large spacing (32px) - for major section separations
} as const;

// Padding Constants - Use for card and section padding
export const DASHBOARD_PADDING = {
    sm: 'p-4', // Small padding (16px) - standard for cards
    md: 'p-6', // Medium padding (24px) - for larger cards
    lg: 'p-8', // Large padding (32px) - for hero sections
} as const;

// Grid Layouts - Use for responsive grid layouts
export const DASHBOARD_GRIDS = {
    kpiCards: 'grid gap-4 md:grid-cols-2 lg:grid-cols-3', // 3 KPI cards
    charts: 'grid gap-4 lg:grid-cols-2', // 2-column chart layout
    fullWidth: 'grid gap-4', // Single column
    twoColumn: 'grid gap-4 lg:grid-cols-2', // 2-column general layout
} as const;

// Chart Heights - Use for consistent chart sizing
export const CHART_HEIGHTS = {
    small: 250,
    medium: 350,
    large: 450,
} as const;

// Border Styles - Use for consistent borders
export const DASHBOARD_BORDERS = {
    section: 'border-t border-border',
    card: 'border border-border',
    cardSubtle: 'border border-border/30',
} as const;

// Gradient Variants - Use for card backgrounds
export const DASHBOARD_GRADIENTS = {
    primary: 'from-primary/10 to-primary/5',
    success: 'from-success/10 to-success/5',
    info: 'from-info/10 to-info/5',
    warning: 'from-warning/10 to-warning/5',
    muted: 'from-muted/20 to-muted/5',
} as const;

// Text Size Classes - Use for consistent text sizing
export const DASHBOARD_TEXT = {
    pageTitle: 'text-2xl font-bold',
    sectionTitle: 'text-lg font-semibold',
    cardTitle: 'text-base font-semibold',
    label: 'text-sm font-medium',
    description: 'text-sm text-muted-foreground',
    helper: 'text-xs text-muted-foreground',
} as const;

// Icon Sizes - Use for consistent icon sizing
export const DASHBOARD_ICON_SIZES = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
} as const;

// Hover and Transition Effects
export const DASHBOARD_EFFECTS = {
    hoverCard: 'hover:bg-muted/30 transition-colors',
    hoverRow: 'hover:bg-muted/20 transition-colors',
    transition: 'transition-colors duration-200',
} as const;

// Common Component Classes
export const COMPONENT_CLASSES = {
    stripedTable: 'odd:bg-muted/20',
    tableHeader: 'border-b border-border bg-muted/30',
    tableRow: 'border-b border-border',
} as const;
