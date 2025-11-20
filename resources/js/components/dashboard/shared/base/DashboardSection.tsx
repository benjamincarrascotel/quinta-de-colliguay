import { cn } from '@/lib/utils';
import React from 'react';
import { DASHBOARD_BORDERS, DASHBOARD_SPACING, DASHBOARD_TEXT } from '../utils/dashboard-shared-styles';
import type { SpacingSize } from '../utils/dashboard-types';

interface DashboardSectionProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
    className?: string;
    borderTop?: boolean;
    spacing?: SpacingSize;
    as?: React.ElementType;
}

/**
 * DashboardSection - Container wrapper for major dashboard sections
 *
 * Provides consistent spacing and layout for major sections within dashboards.
 * Can include an optional title, description, and border separator.
 *
 * @param {React.ReactNode} children - Section content
 * @param {string} [title] - Optional section title
 * @param {string} [description] - Optional section description
 * @param {string} [className] - Additional CSS classes
 * @param {boolean} [borderTop=false] - Show border separator at top
 * @param {'sm' | 'md' | 'lg'} [spacing='sm'] - Internal spacing (sm=space-y-4, md=space-y-6, lg=space-y-8)
 * @param {React.ElementType} [as='section'] - HTML element to render as
 *
 * @example
 * // Basic section
 * <DashboardSection title="Metrics">
 *   <KpiCards />
 * </DashboardSection>
 *
 * @example
 * // Section with border separator and history
 * <DashboardSection borderTop spacing="lg" title="History">
 *   <HistoryComponent />
 * </DashboardSection>
 */
export function DashboardSection({
    children,
    title,
    description,
    className,
    borderTop = false,
    spacing = 'sm',
    as: Element = 'section',
}: DashboardSectionProps) {
    const spacingClass = DASHBOARD_SPACING[spacing];

    return (
        <Element className={cn('flex flex-col gap-4', borderTop && cn(DASHBOARD_BORDERS.section, 'mt-12 pt-12'), className)}>
            {(title || description) && (
                <div className="flex flex-col gap-1">
                    {title && <h2 className={cn(DASHBOARD_TEXT.sectionTitle)}>{title}</h2>}
                    {description && <p className={cn(DASHBOARD_TEXT.description)}>{description}</p>}
                </div>
            )}

            <div className={spacingClass}>{children}</div>
        </Element>
    );
}

export default DashboardSection;
