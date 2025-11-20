import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp } from 'lucide-react';
import React from 'react';
import { DASHBOARD_ICON_SIZES, DASHBOARD_TEXT } from '../utils/dashboard-shared-styles';
import type { KpiData } from '../utils/dashboard-types';

interface KpiCardProps extends Omit<KpiData, 'icon'> {
    icon: React.ComponentType<{ className?: string }>;
    className?: string;
}

/**
 * KpiCard - Key Performance Indicator card component
 *
 * Displays a single metric with icon, title, and optional trend information.
 * Supports multiple color variants for different metric types.
 *
 * @param {string} title - KPI title/label
 * @param {string | number} value - KPI value
 * @param {React.ComponentType} icon - Lucide React icon component
 * @param {'primary' | 'success' | 'warning' | 'info' | 'destructive' | 'default'} [variant='primary'] - Color variant
 * @param {string} [description] - Optional description/subtitle
 * @param {Object} [trend] - Optional trend information
 * @param {string} [className] - Additional CSS classes
 *
 * @example
 * // Basic KPI card
 * <KpiCard
 *   title="Total Machines"
 *   value={42}
 *   icon={Package}
 * />
 *
 * @example
 * // KPI with trend
 * <KpiCard
 *   title="Revenue"
 *   value="$12,500"
 *   icon={TrendingUp}
 *   variant="success"
 *   trend={{
 *     value: 12,
 *     label: "vs last month",
 *     direction: "up"
 *   }}
 * />
 */
export function KpiCard({ title, value, icon: Icon, variant = 'primary', description, trend, className }: KpiCardProps) {
    const variantClasses = {
        primary: 'from-primary/10 to-primary/5 text-primary',
        success: 'from-success/10 to-success/5 text-success',
        warning: 'from-warning/10 to-warning/5 text-warning',
        info: 'from-info/10 to-info/5 text-info',
        destructive: 'from-destructive/10 to-destructive/5 text-destructive',
        default: 'from-muted/10 to-muted/5 text-muted-foreground',
    } as const;

    const variantClass = variantClasses[variant as keyof typeof variantClasses] || variantClasses.default;
    const [bgClass, textClass] = variantClass.split(' text-');

    return (
        <Card className={cn('border border-border', className)}>
            <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                    <div className="flex flex-1 flex-col gap-2">
                        <p className={cn(DASHBOARD_TEXT.label, 'text-muted-foreground')}>{title}</p>
                        <div className="flex items-baseline gap-2">
                            <p className={cn(DASHBOARD_TEXT.pageTitle, 'font-bold')}>{value}</p>
                            {trend && (
                                <div
                                    className={cn(
                                        'flex items-center gap-1 text-xs font-medium',
                                        trend.direction === 'up' && 'text-success',
                                        trend.direction === 'down' && 'text-destructive',
                                        trend.direction === 'neutral' && 'text-muted-foreground',
                                    )}
                                >
                                    {trend.direction === 'up' && <ArrowUp className="h-3 w-3" />}
                                    {trend.direction === 'down' && <ArrowDown className="h-3 w-3" />}
                                    <span>
                                        {trend.value}% {trend.label}
                                    </span>
                                </div>
                            )}
                        </div>
                        {description && <p className={cn(DASHBOARD_TEXT.helper)}>{description}</p>}
                    </div>

                    <div className={cn('flex items-center justify-center rounded-lg p-3', 'bg-gradient-to-br', bgClass, 'text-' + textClass)}>
                        <Icon className={cn(DASHBOARD_ICON_SIZES.xl)} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default KpiCard;
