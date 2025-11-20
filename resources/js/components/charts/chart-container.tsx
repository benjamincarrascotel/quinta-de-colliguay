import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import type { ChartContainerProps } from '@/types/charts';
import { AlertCircle } from 'lucide-react';

export function ChartContainer({
    loading = false,
    error = null,
    isEmpty = false,
    emptyMessage = 'No hay datos disponibles',
    children,
    className = '',
}: ChartContainerProps) {
    if (loading) {
        return (
            <div className={`flex items-center justify-center p-8 ${className}`}>
                <Skeleton className="h-[300px] w-full" />
            </div>
        );
    }

    if (error) {
        return (
            <div className={`p-4 ${className}`}>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    if (isEmpty) {
        return (
            <div className={`flex items-center justify-center p-8 ${className}`}>
                <div className="text-center text-muted-foreground">
                    <AlertCircle className="mx-auto mb-2 h-12 w-12 opacity-50" />
                    <p>{emptyMessage}</p>
                </div>
            </div>
        );
    }

    return <div className={className}>{children}</div>;
}
