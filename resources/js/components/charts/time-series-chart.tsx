import { getEChartsTheme } from '@/lib/echarts-theme';
import type { TimeSeriesChartProps } from '@/types/charts';
import type { EChartsOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import { useEffect, useMemo, useState } from 'react';
import { ChartContainer } from './chart-container';

export function TimeSeriesChart({
    series,
    title,
    xAxisLabel,
    yAxisLabel,
    showZoom = true,
    loading = false,
    className = '',
    height = 400,
    chartRef,
}: TimeSeriesChartProps) {
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
        const seriesData = series.map((line) => ({
            name: line.name,
            type: 'line' as const,
            data: line.data.map((point) => [typeof point.date === 'string' ? new Date(point.date) : point.date, point.value]),
            ...theme.line,
            smooth: true,
            itemStyle: line.color ? { color: line.color } : undefined,
            lineStyle: line.color ? { color: line.color } : undefined,
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
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                },
            },
            legend:
                series.length > 1
                    ? {
                          ...theme.legend,
                          data: series.map((s) => s.name),
                          bottom: 0,
                      }
                    : undefined,
            grid: {
                ...theme.grid,
                bottom: series.length > 1 ? 60 : '3%',
            },
            xAxis: {
                type: 'time',
                name: xAxisLabel,
                boundaryGap: false,
                axisLine: theme.categoryAxis?.axisLine,
                axisTick: theme.categoryAxis?.axisTick,
                axisLabel: theme.categoryAxis?.axisLabel,
                splitLine: theme.categoryAxis?.splitLine,
            },
            yAxis: {
                type: 'value',
                name: yAxisLabel,
                ...theme.valueAxis,
            },
            dataZoom: showZoom
                ? [
                      {
                          type: 'inside' as const,
                          start: 0,
                          end: 100,
                      },
                      {
                          start: 0,
                          end: 100,
                          height: 30,
                          bottom: series.length > 1 ? 40 : 10,
                      },
                  ]
                : undefined,
            series: seriesData,
        };
    }, [series, title, xAxisLabel, yAxisLabel, showZoom, theme]);

    const isEmpty = series.length === 0 || series.every((s) => s.data.length === 0);

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
