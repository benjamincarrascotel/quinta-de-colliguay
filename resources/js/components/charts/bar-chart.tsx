import { getEChartsTheme } from '@/lib/echarts-theme';
import type { BarChartProps } from '@/types/charts';
import type { EChartsOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import { useEffect, useMemo, useState } from 'react';
import { ChartContainer } from './chart-container';

export function BarChart({
    data,
    title,
    xAxisLabel,
    yAxisLabel,
    horizontal = false,
    stacked = false,
    loading = false,
    className = '',
    height = 400,
    chartRef,
}: BarChartProps) {
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
        const categories = data.map((item) => item.name);
        const values = data.map((item) => item.value);
        const colors = data.map((item) => item.color);

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
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow',
                },
            },
            grid: {
                ...theme.grid,
                left: horizontal ? '15%' : '3%',
            },
            xAxis: horizontal
                ? {
                      type: 'value',
                      ...theme.valueAxis,
                  }
                : {
                      type: 'category',
                      data: categories,
                      name: xAxisLabel,
                      ...theme.categoryAxis,
                  },
            yAxis: horizontal
                ? {
                      type: 'category',
                      data: categories,
                      name: yAxisLabel,
                      ...theme.categoryAxis,
                  }
                : {
                      type: 'value',
                      name: yAxisLabel,
                      ...theme.valueAxis,
                  },
            series: [
                {
                    type: 'bar',
                    data: values.map((value, index) => ({
                        value,
                        itemStyle: colors[index] ? { color: colors[index] } : undefined,
                    })),
                    stack: stacked ? 'total' : undefined,
                    ...theme.bar,
                },
            ],
        };
    }, [data, title, xAxisLabel, yAxisLabel, horizontal, stacked, theme]);

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
