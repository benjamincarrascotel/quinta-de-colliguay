import { cn } from '@/lib/utils';
import ECharts from 'echarts';
import React, { useEffect, useMemo } from 'react';
import { GAUGE_COLORS } from '../utils/dashboard-colors';
import type { ChartSize } from '../utils/dashboard-types';

interface DashboardGaugeChartProps {
    operabilityIndex: number;
    failureIndex?: number;
    size?: ChartSize | number;
    colors?: {
        operational: string;
        failure: string;
        background: string;
    };
    showLabels?: boolean;
    className?: string;
}

/**
 * DashboardGaugeChart - Semi-circular gauge chart component
 *
 * Displays operational and failure indices in a semi-circular gauge format.
 * Automatically handles dark/light mode and provides customizable colors.
 *
 * @param {number} operabilityIndex - Operability percentage (0-100)
 * @param {number} [failureIndex] - Optional failure percentage (0-100)
 * @param {'sm' | 'md' | 'lg' | number} [size='md'] - Chart size
 * @param {Object} [colors] - Custom color configuration
 * @param {boolean} [showLabels=true] - Show percentage labels
 * @param {string} [className] - Additional CSS classes
 */
export function DashboardGaugeChart({ operabilityIndex, failureIndex, size = 'md', colors, className }: DashboardGaugeChartProps) {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const chartRef = React.useRef<ECharts.ECharts | null>(null);

    // Calculate height
    const chartHeight = useMemo(() => {
        if (typeof size === 'number') return size;
        const heightMap = { sm: 200, md: 250, lg: 300 };
        return heightMap[size as ChartSize] || heightMap.md;
    }, [size]);

    // Get colors
    const chartColors = useMemo(
        () => ({
            operational: colors?.operational || GAUGE_COLORS.operational,
            failure: colors?.failure || GAUGE_COLORS.failure,
            background: colors?.background || GAUGE_COLORS.background,
        }),
        [colors],
    );

    // Initialize chart
    useEffect(() => {
        if (!containerRef.current) return;

        if (!chartRef.current) {
            chartRef.current = ECharts.init(containerRef.current);
        }

        const chart = chartRef.current;

        // Ensure indices are within 0-100
        const operational = Math.max(0, Math.min(100, operabilityIndex));
        const failure = failureIndex ? Math.max(0, Math.min(100, failureIndex)) : 0;

        // Build series configuration
        const seriesConfig = [
            {
                type: 'gauge' as const,
                startAngle: 200,
                endAngle: -20,
                min: 0,
                max: 100,
                splitNumber: 10,
                axisLine: {
                    lineStyle: {
                        width: 30,
                        color: [
                            [0.3, chartColors.failure],
                            [1, chartColors.operational],
                        ],
                    },
                },
                pointer: {
                    itemStyle: {
                        color: 'auto',
                    },
                    width: 8,
                },
                axisTick: {
                    distance: -30,
                    length: 8,
                    lineStyle: {
                        color: '#fff',
                        width: 2,
                    },
                },
                splitLine: {
                    distance: -30,
                    length: 30,
                    lineStyle: {
                        color: '#fff',
                        width: 4,
                    },
                },
                axisLabel: {
                    color: 'auto',
                    distance: 40,
                    fontSize: 11,
                },
                detail: {
                    valueAnimation: true,
                    formatter: '{value}%',
                    color: 'auto',
                    fontSize: 16,
                    offsetCenter: [0, '70%'],
                },
                data: [{ value: operational, name: 'Operabilidad' }],
            },
            ...(failureIndex !== undefined
                ? [
                      {
                          type: 'gauge' as const,
                          startAngle: 200,
                          endAngle: -20,
                          min: 0,
                          max: 100,
                          center: ['75%', '50%'],
                          radius: '60%',
                          splitNumber: 10,
                          axisLine: {
                              lineStyle: {
                                  width: 20,
                                  color: [
                                      [failure / 100, chartColors.failure],
                                      [1, chartColors.background],
                                  ],
                              },
                          },
                          pointer: {
                              itemStyle: {
                                  color: 'auto',
                              },
                              width: 6,
                          },
                          axisTick: {
                              distance: -20,
                              length: 6,
                              lineStyle: {
                                  color: '#fff',
                                  width: 1,
                              },
                          },
                          splitLine: {
                              distance: -20,
                              length: 20,
                              lineStyle: {
                                  color: '#fff',
                                  width: 2,
                              },
                          },
                          axisLabel: {
                              color: 'auto',
                              distance: 30,
                              fontSize: 10,
                          },
                          detail: {
                              valueAnimation: true,
                              formatter: '{value}%',
                              color: 'auto',
                              fontSize: 14,
                              offsetCenter: [0, '65%'],
                          },
                          data: [{ value: failure, name: 'Falla' }],
                      },
                  ]
                : []),
        ];

        const option = {
            series: seriesConfig,
        };

        chart.setOption(option as Parameters<typeof chart.setOption>[0]);

        // Handle resize
        const handleResize = () => {
            chart.resize();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [operabilityIndex, failureIndex, chartColors]);

    // Watch for theme changes
    useEffect(() => {
        const observer = new MutationObserver(() => {
            if (chartRef.current) {
                chartRef.current.resize();
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

export default DashboardGaugeChart;
