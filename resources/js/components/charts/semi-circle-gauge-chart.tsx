import { ChartContainer } from '@/components/charts/chart-container';
import { getEChartsTheme } from '@/lib/echarts-theme';
import type ReactECharts from 'echarts-for-react';
import ReactEChartsComponent from 'echarts-for-react';
import { forwardRef, useEffect, useMemo, useState } from 'react';

interface SemiCircleGaugeChartProps {
    operabilityIndex: number;
    alertIndex: number;
    positionVariant?: 'dashboard' | 'machine-history';
}

export const SemiCircleGaugeChart = forwardRef<ReactECharts, SemiCircleGaugeChartProps>(
    ({ operabilityIndex, positionVariant = 'dashboard' }, ref) => {
        const [echartsTheme, setEchartsTheme] = useState(getEChartsTheme());

        // Position configuration based on variant
        const positionConfig = {
            dashboard: {
                center: ['50%', '60%'] as [string, string],
                offsetCenter: [0, '40%'] as [number, string],
            },
            'machine-history': {
                center: ['50%', '30%'] as [string, string],
                offsetCenter: [0, '45%'] as [number, string],
            },
        };

        const currentPosition = positionConfig[positionVariant];

        // Update theme when dark mode changes
        useEffect(() => {
            const observer = new MutationObserver(() => {
                setEchartsTheme(getEChartsTheme());
            });

            observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['class'],
            });

            return () => observer.disconnect();
        }, []);

        const option = useMemo(
            () => ({
                tooltip: {
                    trigger: 'item' as const,
                    formatter: (params: { componentSubType: string; name: string; value: number }) => {
                        if (params.componentSubType === 'gauge') {
                            return `${params.name}: ${params.value.toFixed(1)}%`;
                        }
                        return '';
                    },
                },
                series: [
                    {
                        type: 'gauge' as const,
                        startAngle: 180,
                        endAngle: 0,
                        min: 0,
                        max: 100,
                        radius: '75%',
                        center: currentPosition.center,
                        axisLine: {
                            lineStyle: {
                                width: 30,
                                color: [
                                    [operabilityIndex / 100, '#10B981'], // Green for operability
                                    [1, '#EF4444'], // Red for alerts
                                ],
                            },
                        },
                        axisTick: {
                            show: false,
                        },
                        axisLabel: {
                            show: false,
                        },
                        splitLine: {
                            show: false,
                        },
                        pointer: {
                            itemStyle: {
                                color: 'auto',
                            },
                            length: '60%',
                            width: 8,
                        },
                        detail: {
                            valueAnimation: true,
                            formatter: (value: number) => `${value.toFixed(1)}%`,
                            color: '#10B981',
                            fontSize: 18,
                            fontWeight: 'bold',
                            offsetCenter: currentPosition.offsetCenter,
                        },
                        data: [
                            {
                                value: operabilityIndex,
                                name: 'Operatividad',
                            },
                        ],
                    },
                ],
            }),
            [operabilityIndex, currentPosition],
        );

        return (
            <ChartContainer>
                <ReactEChartsComponent
                    ref={ref}
                    option={option}
                    theme={echartsTheme}
                    style={{ height: '250px', width: '100%' }}
                    opts={{ renderer: 'canvas' }}
                />
            </ChartContainer>
        );
    },
);

SemiCircleGaugeChart.displayName = 'SemiCircleGaugeChart';
