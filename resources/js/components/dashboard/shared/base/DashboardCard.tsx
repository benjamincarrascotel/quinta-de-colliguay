import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import React from 'react';
import { DASHBOARD_GRADIENTS, DASHBOARD_PADDING } from '../utils/dashboard-shared-styles';
import type { DashboardCardVariant, PaddingSize } from '../utils/dashboard-types';

interface DashboardCardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    description?: string;
    headerActions?: React.ReactNode;
    variant?: DashboardCardVariant;
    padding?: PaddingSize;
}

/**
 * DashboardCard - Parametrizable card component for dashboard sections
 *
 * A flexible wrapper around shadcn/ui Card that provides consistent styling
 * and layout for dashboard content. Supports multiple visual variants and
 * optional header with title, description, and actions.
 *
 * @param {React.ReactNode} children - Card content
 * @param {string} [className] - Additional CSS classes
 * @param {string} [title] - Optional card title
 * @param {string} [description] - Optional card description
 * @param {React.ReactNode} [headerActions] - Optional actions in header (export buttons, etc.)
 * @param {'default' | 'gradient' | 'muted'} [variant='default'] - Visual variant
 * @param {'sm' | 'md' | 'lg'} [padding='sm'] - Padding size (sm=p-4, md=p-6, lg=p-8)
 *
 * @example
 * // Basic card
 * <DashboardCard title="Metrics">
 *   <KpiCard {...data} />
 * </DashboardCard>
 *
 * @example
 * // Card with gradient and actions
 * <DashboardCard
 *   variant="gradient"
 *   title="Reports"
 *   headerActions={<Button>Export</Button>}
 * >
 *   <DataTable />
 * </DashboardCard>
 */
export function DashboardCard({ children, className, title, description, headerActions, variant = 'default', padding = 'sm' }: DashboardCardProps) {
    const variantClasses = {
        default: '',
        gradient: cn('bg-gradient-to-br', DASHBOARD_GRADIENTS.primary),
        muted: 'bg-muted/20',
    };

    const contentPaddingClass = padding === 'sm' ? '' : DASHBOARD_PADDING[padding];

    return (
        <Card className={cn('border border-border', variantClasses[variant], className)}>
            {(title || description || headerActions) && (
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div className="flex flex-col gap-1">
                        {title && <CardTitle>{title}</CardTitle>}
                        {description && <CardDescription>{description}</CardDescription>}
                    </div>
                    {headerActions && <div className="flex gap-2">{headerActions}</div>}
                </CardHeader>
            )}

            <CardContent className={cn(contentPaddingClass || DASHBOARD_PADDING.sm)}>{children}</CardContent>
        </Card>
    );
}

export default DashboardCard;
