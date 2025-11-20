import { getEChartsTheme } from '@/lib/echarts-theme';
import type { PieChartProps } from '@/types/charts';
import type { EChartsOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import { useEffect, useMemo, useState } from 'react';
import { ChartContainer } from './chart-container';

export function PieChart({
    data,
    title,
    showLegend = true,
    legendPosition = 'bottom',
    radius = ['40%', '70%'],
    loading = false,
    className = '',
    height = 400,
    chartRef,
}: PieChartProps) {
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

    const option: EChartsOption = useMemo(() => {
        const chartData = data.map((item) => ({
            name: item.name,
            value: item.value,
            itemStyle: item.color ? { color: item.color } : undefined,
        }));

        return {
            ...theme,
            title: title
                ? {
                      text: title,
                      ...theme.title,
                  }
                : undefined,
            tooltip: {
                ...theme.tooltip,
                trigger: 'item',
                formatter: '{b}: {c} ({d}%)',
            },
            legend: showLegend
                ? {
                      ...theme.legend,
                      orient: legendPosition === 'left' || legendPosition === 'right' ? 'vertical' : 'horizontal',
                      [legendPosition]: legendPosition === 'top' ? 10 : legendPosition === 'bottom' ? 10 : 20,
                      top: legendPosition === 'top' ? 'top' : legendPosition === 'bottom' ? 'bottom' : 'middle',
                  }
                : {
                      show: false,
                  },
            series: [
                {
                    type: 'pie',
                    radius,
                    data: chartData,
                    ...theme.pie,
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)',
                        },
                    },
                    label: {
                        ...theme.pie?.label,
                        show: true,
                        formatter: '{b}: {d}%',
                    },
                    labelLine: {
                        ...theme.pie?.labelLine,
                        show: true,
                    },
                },
            ],
        };
    }, [data, title, showLegend, legendPosition, radius, theme]);

    const isEmpty = data.length === 0 || data.every((item) => item.value === 0);

    return (
        <ChartContainer loading={loading} isEmpty={isEmpty} className={className}>
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
