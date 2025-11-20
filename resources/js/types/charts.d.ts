import type { ReactECharts } from 'echarts-for-react';

/**
 * Base chart component props
 */
export interface BaseChartProps {
    loading?: boolean;
    className?: string;
    height?: number | string;
}

/**
 * Pie Chart Data Item
 */
export interface PieChartDataItem {
    name: string;
    value: number;
    color?: string;
}

/**
 * Pie Chart Props
 */
export interface PieChartProps extends BaseChartProps {
    data: PieChartDataItem[];
    title?: string;
    showLegend?: boolean;
    legendPosition?: 'top' | 'bottom' | 'left' | 'right';
    radius?: string | [string, string];
    chartRef?: (ref: ReactECharts | null) => void;
}

/**
 * Gauge Chart Props
 */
export interface GaugeChartProps extends BaseChartProps {
    value: number;
    title?: string;
    min?: number;
    max?: number;
    unit?: string;
    chartRef?: (ref: ReactECharts | null) => void;
}

/**
 * Bar Chart Data Item
 */
export interface BarChartDataItem {
    name: string;
    value: number;
    color?: string;
}

/**
 * Bar Chart Props
 */
export interface BarChartProps extends BaseChartProps {
    data: BarChartDataItem[];
    title?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    horizontal?: boolean;
    stacked?: boolean;
    chartRef?: (ref: ReactECharts | null) => void;
}

/**
 * Time Series Data Point
 */
export interface TimeSeriesDataPoint {
    date: string | Date;
    value: number;
}

/**
 * Time Series Line
 */
export interface TimeSeriesLine {
    name: string;
    data: TimeSeriesDataPoint[];
    color?: string;
}

/**
 * Time Series Chart Props
 */
export interface TimeSeriesChartProps extends BaseChartProps {
    series: TimeSeriesLine[];
    title?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    showZoom?: boolean;
    chartRef?: (ref: ReactECharts | null) => void;
}

/**
 * Chart Container Props
 */
export interface ChartContainerProps {
    loading?: boolean;
    error?: string | null;
    isEmpty?: boolean;
    emptyMessage?: string;
    children: React.ReactNode;
    className?: string;
}
