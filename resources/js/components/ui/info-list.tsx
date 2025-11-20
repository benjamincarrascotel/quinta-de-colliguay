import { cn } from '@/lib/utils';

type InfoListVariant = 'default' | 'warning' | 'destructive' | 'success';

interface InfoListProps {
    title?: string;
    items: (string | React.ReactNode)[];
    variant?: InfoListVariant;
    emptyMessage?: string;
    className?: string;
}

const variantStyles: Record<InfoListVariant, string> = {
    default: 'rounded-md border p-3',
    warning: 'rounded-md border border-amber-100 bg-amber-50 p-3 dark:border-amber-200/10 dark:bg-amber-700/10',
    destructive: 'rounded-md border border-red-100 bg-red-50 p-3 dark:border-red-200/10 dark:bg-red-700/10',
    success: 'rounded-md border border-green-100 bg-green-50 p-3 dark:border-green-200/10 dark:bg-green-700/10',
};

const variantTextStyles: Record<InfoListVariant, string> = {
    default: '',
    warning: 'text-amber-900 dark:text-amber-100',
    destructive: 'text-red-900 dark:text-red-100',
    success: 'text-green-900 dark:text-green-100',
};

const variantItemStyles: Record<InfoListVariant, string> = {
    default: '',
    warning: 'text-amber-800 dark:text-amber-200',
    destructive: 'text-red-800 dark:text-red-200',
    success: 'text-green-800 dark:text-green-200',
};

export function InfoList({ title, items, variant = 'default', emptyMessage, className }: InfoListProps) {
    if (items.length === 0 && emptyMessage) {
        return (
            <p className={cn('rounded-md border p-3 text-sm text-muted-foreground', className)}>
                {emptyMessage}
            </p>
        );
    }

    return (
        <div className={className}>
            {title && (
                <p className={cn('mb-2 text-sm font-semibold', variantTextStyles[variant])}>
                    {title}
                </p>
            )}
            <ul className={cn('list-inside list-disc space-y-1 text-sm', variantStyles[variant], variantItemStyles[variant])}>
                {items.map((item, index) => (
                    <li key={index}>
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
}
