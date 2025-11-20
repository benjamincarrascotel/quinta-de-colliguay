import { getEChartsTheme } from '@/lib/echarts-theme';
import { cn } from '@/lib/utils';
import ECharts from 'echarts';
import React, { useEffect, useMemo, useState } from 'react';
import { CHART_HEIGHTS } from '../utils/dashboard-shared-styles';
import type { ChartSize, PieChartData } from '../utils/dashboard-types';

interface DashboardPieChartProps {
    data: PieChartData[];
    title: string;
    height?: number | ChartSize;
    radius?: [string, string];
    legend?: 'bottom' | 'right' | 'none';
    colors?: string[];
    onClick?: (data: { name: string; value: number; color: string }) => void;
    className?: string;
}

/**
 * DashboardPieChart - Parametrizable pie/donut chart component
 *
 * Wrapper around ECharts that provides theme-aware pie chart visualization.
 * Automatically handles dark/light mode transitions and supports custom colors.
 *
 * @param {PieChartData[]} data - Chart data array
 * @param {string} title - Chart title
 * @param {number | 'sm' | 'md' | 'lg'} [height='md'] - Chart height in pixels or size preset
 * @param {[string, string]} [radius=['40%', '70%']] - Inner/outer radius for donut effect
 * @param {'bottom' | 'right' | 'none'} [legend='bottom'] - Legend position
 * @param {string[]} [colors] - Custom color palette
 * @param {Function} [onClick] - Click handler for chart elements
 * @param {string} [className] - Additional CSS classes
 */
export function DashboardPieChart({
    data,
    title,
    height = 'md',
    radius = ['40%', '70%'],
    legend = 'bottom',
    colors,
    onClick,
    className,
}: DashboardPieChartProps) {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const chartRef = React.useRef<ECharts.ECharts | null>(null);
    const [, setTheme] = useState('light');

    // Calculate height
    const chartHeight = useMemo(() => {
        if (typeof height === 'number') return height;
        return CHART_HEIGHTS[height as keyof typeof CHART_HEIGHTS] || CHART_HEIGHTS.medium;
    }, [height]);

    // Initialize and update chart
    useEffect(() => {
        if (!containerRef.current) return;

        // Initialize chart if not already done
        if (!chartRef.current) {
            chartRef.current = ECharts.init(containerRef.current);
        }

        const chart = chartRef.current;

        // Get current theme
        const isDark = document.documentElement.classList.contains('dark');
        setTheme(isDark ? 'dark' : 'light');

        // Build series data
        const seriesData = data.map((item) => ({
            name: item.name,
            value: item.value,
            itemStyle: item.color ? { color: item.color } : undefined,
        }));

        // Build option with proper typing
        const option = {
            title: {
                text: title,
                left: 'center' as const,
                top: 0,
                textStyle: {
                    color: isDark ? '#f5f5f5' : '#1f2937',
                    fontSize: 14,
                },
            },
            tooltip: {
                trigger: 'item' as const,
                formatter: '{b}: {c} ({d}%)',
            },
            legend: {
                orient: (legend === 'right' ? 'vertical' : 'horizontal') as 'horizontal' | 'vertical',
                left: legend === 'right' ? 'right' : 'center',
                bottom: legend === 'bottom' ? 0 : undefined,
                top: legend === 'right' ? 'center' : undefined,
                textStyle: {
                    color: isDark ? '#a0a0a0' : '#6b7280',
                },
            },
            series: [
                {
                    name: title,
                    type: 'pie' as const,
                    radius: radius,
                    center: ['50%', '55%'] as [string, string],
                    data: seriesData,
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                        },
                    },
                    label: {
                        show: false,
                    },
                },
            ],
            color: colors || undefined,
        };

        // Apply theme
        const themeConfig = getEChartsTheme();
        chart.setOption(option as Parameters<typeof chart.setOption>[0]);
        if (themeConfig) {
            chart.setOption(themeConfig as Parameters<typeof chart.setOption>[0], true);
        }

        // Handle resize
        const handleResize = () => {
            chart.resize();
        };

        window.addEventListener('resize', handleResize);

        // Handle click
        if (onClick) {
            chart.on('click', (params: { name: string; value: number; color: string }) => {
                onClick(params);
            });
        }

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [data, title, radius, legend, colors, onClick]);

    // Watch for theme changes
    useEffect(() => {
        const observer = new MutationObserver(() => {
            if (chartRef.current) {
                chartRef.current.setOption({
                    title: {
                        textStyle: {
                            color: document.documentElement.classList.contains('dark') ? '#f5f5f5' : '#1f2937',
                        },
                    },
                    legend: {
                        textStyle: {
                            color: document.documentElement.classList.contains('dark') ? '#a0a0a0' : '#6b7280',
                        },
                    },
                });
            }
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    return <div ref={containerRef} className={cn('w-full bg-transparent', className)} style={{ height: `${chartHeight}px` }} />;
}

export default DashboardPieChart;
