import { cn } from '@/lib/utils';
import { DashboardGaugeChart } from '../charts/DashboardGaugeChart';
import type { GaugeChartData } from '../utils/dashboard-types';

type ChartType = 'gauge' | 'sparkline' | 'bar' | 'progress';

interface DataTableChartProps {
    type: ChartType;
    data:
        | GaugeChartData
        | { value: number; max: number }
        | { values: number[]; trend: 'up' | 'down' | 'neutral' }
        | { filled: number; total: number };
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

/**
 * DataTableChart - Wrapper component for rendering charts within table cells
 *
 * Injects various chart types into dashboard data tables.
 * Handles sizing and styling for compact chart display.
 *
 * @param {'gauge' | 'sparkline' | 'bar' | 'progress'} type - Chart type
 * @param {any} data - Data specific to chart type
 * @param {'sm' | 'md' | 'lg'} [size='sm'] - Chart size
 * @param {string[]} [colors] - Custom colors
 * @param {string} [className] - Additional CSS classes
 *
 * @example
 * // Gauge chart in table cell
 * <DataTableChart
 *   type="gauge"
 *   data={{
 *     operabilityIndex: 85,
 *     failureIndex: 15
 *   }}
 *   size="sm"
 * />
 *
 * @example
 * // Progress bar in table cell
 * <DataTableChart
 *   type="progress"
 *   data={{ value: 75, max: 100 }}
 *   size="sm"
 * />
 */
export function DataTableChart({ type, data, size = 'sm', className }: DataTableChartProps) {
    // Gauge Chart
    if (type === 'gauge') {
        const gaugeData = data as GaugeChartData;
        return (
            <div className={cn('flex items-center justify-center', className)}>
                <DashboardGaugeChart
                    operabilityIndex={gaugeData.operabilityIndex}
                    failureIndex={gaugeData.failureIndex}
                    size={size as 'sm' | 'md' | 'lg'}
                    showLabels={true}
                />
            </div>
        );
    }

    // Progress Bar
    if (type === 'progress') {
        const progressData = data as { value: number; max: number; label?: string };
        const percentage = (progressData.value / (progressData.max || 100)) * 100;

        return (
            <div className={cn('flex items-center gap-2', className)}>
                <div className="flex-1">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${Math.min(100, percentage)}%` }} />
                    </div>
                </div>
                {progressData.label && <span className="w-12 text-right text-xs font-medium text-muted-foreground">{progressData.label}</span>}
            </div>
        );
    }

    // Bar Chart (simplified - could be extended with ECharts)
    if (type === 'bar') {
        const barData = data as { value: number; max?: number };
        const percentage = Math.min(100, (barData.value / (barData.max || 100)) * 100);

        return (
            <div className={cn('flex items-center gap-2', className)}>
                <div className="flex-1">
                    <div className="h-3 w-full overflow-hidden rounded bg-muted">
                        <div className="h-full bg-success transition-all duration-300" style={{ width: `${percentage}%` }} />
                    </div>
                </div>
                <span className="min-w-[2rem] text-right text-xs font-medium text-muted-foreground">{barData.value}</span>
            </div>
        );
    }

    // Sparkline (simplified - just showing trend)
    if (type === 'sparkline') {
        const sparklineData = data as { values?: number[]; trend?: 'up' | 'down' | 'neutral' };
        const values = sparklineData.values || [];
        const trend = sparklineData.trend || 'neutral';

        const trendColor = {
            up: 'text-success',
            down: 'text-destructive',
            neutral: 'text-muted-foreground',
        }[trend];

        return (
            <div className={cn('flex items-center gap-2', className)}>
                <div className="flex gap-0.5">
                    {values.slice(-5).map((val, idx) => (
                        <div
                            key={idx}
                            className={cn('rounded-sm', 'bg-primary')}
                            style={{
                                width: '4px',
                                height: `${Math.max(4, (val / Math.max(...values)) * 20)}px`,
                            }}
                        />
                    ))}
                </div>
                <span className={cn('text-xs font-medium', trendColor)}>{trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}</span>
            </div>
        );
    }

    return null;
}

export default DataTableChart;
