import type ReactECharts from 'echarts-for-react';

/**
 * Export chart as PNG data URL for PDF generation
 */
export function exportChartAsImage(
    chartRef: ReactECharts | null,
    options: {
        backgroundColor?: string;
        pixelRatio?: number;
        type?: 'png' | 'jpg' | 'svg';
    } = {},
): string | null {
    if (!chartRef) return null;

    try {
        const instance = chartRef.getEchartsInstance();
        return instance.getDataURL({
            type: options.type || 'png',
            pixelRatio: options.pixelRatio || 2,
            backgroundColor: options.backgroundColor || '#ffffff',
        });
    } catch (error) {
        console.error('Error exporting chart:', error);
        return null;
    }
}

/**
 * Export multiple charts as images
 */
export function exportChartsAsImages(
    chartRefs: Record<string, ReactECharts | null>,
    options?: {
        backgroundColor?: string;
        pixelRatio?: number;
        type?: 'png' | 'jpg' | 'svg';
    },
): Record<string, string> {
    const images: Record<string, string> = {};

    for (const [key, ref] of Object.entries(chartRefs)) {
        const image = exportChartAsImage(ref, options);
        if (image) {
            images[key] = image;
        }
    }

    return images;
}
