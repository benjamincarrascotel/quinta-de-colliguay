import { getEChartsTheme } from '@/lib/echarts-theme';
import type { GaugeChartProps } from '@/types/charts';
import ReactECharts from 'echarts-for-react';
import { useEffect, useMemo, useState } from 'react';
import { ChartContainer } from './chart-container';

export function GaugeChart({
    value,
    title,
    min = 0,
    max = 100,
    unit = '%',
    loading = false,
    className = '',
    height = 300,
    chartRef,
}: GaugeChartProps) {
    const [theme, setTheme] = useState(getEChartsTheme());

    // Update theme when dark mode changes
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setTheme(getEChartsTheme());
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    const option = useMemo(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const gaugeTheme = theme.gauge as any;

        return {
            ...theme,
            series: [
                {
                    type: 'gauge',
                    min,
                    max,
                    startAngle: 200,
                    endAngle: -20,
                    itemStyle: gaugeTheme?.itemStyle,
                    axisLine: gaugeTheme?.axisLine,
                    axisTick: gaugeTheme?.axisTick,
                    splitLine: gaugeTheme?.splitLine,
                    axisLabel: gaugeTheme?.axisLabel,
                    anchor: gaugeTheme?.anchor,
                    detail: {
                        ...gaugeTheme?.detail,
                        formatter: `{value}${unit}`,
                    },
                    title: {
                        ...gaugeTheme?.title,
                        show: !!title,
                        offsetCenter: [0, '70%'],
                    },
                    data: [
                        {
                            value: Math.round(value * 100) / 100,
                            name: title || '',
                        },
                    ],
                    pointer: {
                        length: '60%',
                        width: 6,
                    },
                    progress: {
                        show: true,
                        roundCap: true,
                        width: 18,
                    },
                },
            ],
        };
    }, [value, title, min, max, unit, theme]);

    return (
        <ChartContainer loading={loading} className={className}>
            <ReactECharts
                ref={chartRef}
                option={option}
                style={{ height: typeof height === 'number' ? `${height}px` : height, width: '100%' }}
                notMerge={true}
                lazyUpdate={true}
            />
        </ChartContainer>
    );
}
