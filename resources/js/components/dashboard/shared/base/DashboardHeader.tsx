import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types/navigation';
import React from 'react';
import { DASHBOARD_TEXT } from '../utils/dashboard-shared-styles';

interface DashboardHeaderProps {
    title: string;
    subtitle?: string;
    className?: string;
    actions?: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

/**
 * DashboardHeader - Consistent header for dashboard pages
 *
 * Provides a standardized header with title, optional subtitle, breadcrumbs,
 * and action buttons (export, filters, etc.).
 *
 * @param {string} title - Main page title
 * @param {string} [subtitle] - Optional subtitle or description
 * @param {string} [className] - Additional CSS classes
 * @param {React.ReactNode} [actions] - Action buttons (export, download, etc.)
 * @param {Breadcrumb[]} [breadcrumbs] - Navigation breadcrumbs
 *
 * @example
 * // Basic header
 * <DashboardHeader title="Dashboard" />
 *
 * @example
 * // Header with breadcrumbs and actions
 * <DashboardHeader
 *   title="Máquinas"
 *   breadcrumbs={[
 *     {title: 'Dashboard', href: '/dashboard'},
 *     {title: 'Máquinas', href: '/machines'}
 *   ]}
 *   actions={<ExportButton />}
 * />
 */
export function DashboardHeader({ title, subtitle, className, actions, breadcrumbs }: DashboardHeaderProps) {
    return (
        <div className={cn('flex flex-col gap-4', className)}>
            {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="flex items-center gap-2 text-sm">
                    {breadcrumbs.map((crumb, index) => (
                        <React.Fragment key={index}>
                            {index > 0 && <span className="text-muted-foreground">/</span>}
                            {crumb.href ? (
                                <a href={crumb.href} className="text-muted-foreground transition-colors hover:text-foreground">
                                    {crumb.title}
                                </a>
                            ) : (
                                <span className="text-foreground">{crumb.title}</span>
                            )}
                        </React.Fragment>
                    ))}
                </nav>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1">
                    <h1 className={cn(DASHBOARD_TEXT.pageTitle)}>{title}</h1>
                    {subtitle && <p className={cn(DASHBOARD_TEXT.description)}>{subtitle}</p>}
                </div>

                {actions && <div className="flex gap-2">{actions}</div>}
            </div>
        </div>
    );
}

export default DashboardHeader;
