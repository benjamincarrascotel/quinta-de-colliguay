/**
 * ECharts Theme Configuration
 * Uses Tailwind CSS color variables from the application
 */

/**
 * Helper function to get computed CSS color value
 */
function getCSSColor(varName: string): string {
    if (typeof window === 'undefined') return '#000000';

    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();

    return value || '#000000';
}

/**
 * Get theme colors based on current mode (light/dark)
 */
export function getThemeColors() {
    const isDark = document.documentElement.classList.contains('dark');

    return {
        // Primary colors
        primary: getCSSColor('--color-primary-light'),
        primaryDark: getCSSColor('--color-primary-dark'),
        secondary: getCSSColor('--color-secondary-light'),

        // Status colors
        alert: isDark ? '#facc15' : '#ca8a04', // amber
        info: isDark ? '#38bdf8' : '#0284c7', // blue
        destructive: '#ef4444', // red
        warning: isDark ? '#f59e0b' : '#d97706', // amber-500

        // Chart colors (5 colors for variety)
        chartColors: isDark
            ? [
                  '#9B59B6', // purple
                  '#1ABC9C', // green-cyan
                  '#E67E22', // orange-yellow
                  '#E91E63', // magenta
                  '#E74C3C', // red-orange
              ]
            : [
                  '#E67E22', // orange
                  '#16A085', // cyan
                  '#3498DB', // blue
                  '#F39C12', // yellow
                  '#E67E22', // orange-yellow
              ],

        // Machine status colors
        operational: getCSSColor('--color-primary-light'), // green
        stopped: isDark ? '#facc15' : '#ca8a04', // amber
        underMaintenance: isDark ? '#38bdf8' : '#0284c7', // blue
        outOfService: '#ef4444', // red

        // Text colors
        text: isDark ? '#f5f5f5' : '#1a1a1a',
        textSecondary: isDark ? '#a3a3a3' : '#666666',

        // Background colors
        background: isDark ? '#252525' : '#ffffff',
        border: isDark ? '#404040' : '#e5e5e5',
    };
}

/**
 * Get ECharts theme configuration
 */
export function getEChartsTheme() {
    const colors = getThemeColors();

    return {
        color: colors.chartColors,
        backgroundColor: 'transparent',

        textStyle: {
            fontFamily: 'Instrument Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: 12,
            color: colors.text,
        },

        title: {
            textStyle: {
                color: colors.text,
                fontWeight: 600,
                fontSize: 16,
            },
            subtextStyle: {
                color: colors.textSecondary,
                fontSize: 12,
            },
        },

        legend: {
            textStyle: {
                color: colors.text,
                fontSize: 12,
            },
            icon: 'circle',
            itemWidth: 12,
            itemHeight: 12,
        },

        tooltip: {
            backgroundColor: colors.background,
            borderColor: colors.border,
            borderWidth: 1,
            textStyle: {
                color: colors.text,
                fontSize: 12,
            },
            axisPointer: {
                lineStyle: {
                    color: colors.border,
                },
                crossStyle: {
                    color: colors.border,
                },
            },
        },

        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: 60,
            containLabel: true,
            borderColor: colors.border,
        },

        categoryAxis: {
            axisLine: {
                show: true,
                lineStyle: {
                    color: colors.border,
                },
            },
            axisTick: {
                show: true,
                lineStyle: {
                    color: colors.border,
                },
            },
            axisLabel: {
                show: true,
                color: colors.textSecondary,
                fontSize: 11,
            },
            splitLine: {
                show: false,
            },
        },

        valueAxis: {
            axisLine: {
                show: false,
            },
            axisTick: {
                show: false,
            },
            axisLabel: {
                show: true,
                color: colors.textSecondary,
                fontSize: 11,
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: colors.border,
                    type: 'dashed' as const,
                },
            },
        },

        line: {
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
                width: 2,
            },
            itemStyle: {
                borderWidth: 2,
            },
        },

        bar: {
            itemStyle: {
                borderRadius: [4, 4, 0, 0],
            },
            barMaxWidth: 40,
        },

        pie: {
            itemStyle: {
                borderRadius: 4,
                borderColor: colors.background,
                borderWidth: 2,
            },
            label: {
                color: colors.text,
                fontSize: 12,
            },
            labelLine: {
                lineStyle: {
                    color: colors.border,
                },
            },
        },

        gauge: {
            itemStyle: {
                color: colors.primary,
            },
            axisLine: {
                lineStyle: {
                    color: [
                        [0.3, colors.destructive],
                        [0.7, colors.stopped],
                        [1, colors.operational],
                    ],
                    width: 20,
                },
            },
            axisTick: {
                distance: -20,
                splitNumber: 5,
                lineStyle: {
                    color: colors.background,
                    width: 2,
                },
            },
            splitLine: {
                distance: -20,
                length: 20,
                lineStyle: {
                    color: colors.background,
                    width: 3,
                },
            },
            axisLabel: {
                distance: 25,
                color: colors.textSecondary,
                fontSize: 11,
            },
            anchor: {
                show: true,
                showAbove: true,
                size: 18,
                itemStyle: {
                    color: colors.primary,
                },
            },
            title: {
                show: true,
                offsetCenter: [0, '70%'],
                fontSize: 14,
                color: colors.text,
                fontWeight: 600,
            },
            detail: {
                valueAnimation: true,
                fontSize: 24,
                fontWeight: 700,
                offsetCenter: [0, '40%'],
                color: colors.text,
                formatter: '{value}%',
            },
        },
    };
}
