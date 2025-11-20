import { Badge } from '@/components/ui/badge';
import type { StatusVariantMap } from '../utils/dashboard-colors';
import { getStatusLabel, getStatusVariant } from '../utils/dashboard-colors';

interface StatusBadgeProps {
    status: string;
    statusMap: StatusVariantMap;
    label?: string;
    className?: string;
}

/**
 * StatusBadge - Configurable badge component for displaying status codes
 *
 * Maps status codes to badge variants using a provided status map.
 * Supports custom labels and automatic formatting of status codes.
 *
 * @param {string} status - Status code (e.g., 'active', 'pending', 'completed')
 * @param {StatusVariantMap} statusMap - Mapping of status codes to badge variants
 * @param {string} [label] - Custom label (defaults to formatted status code)
 * @param {string} [className] - Additional CSS classes
 *
 * @example
 * // Basic usage
 * <StatusBadge
 *   status="active"
 *   statusMap={ALERT_STATUS_MAP}
 * />
 *
 * @example
 * // With custom label
 * <StatusBadge
 *   status="in_progress"
 *   statusMap={ORDER_STATUS_MAP}
 *   label="Currently Processing"
 * />
 */
export function StatusBadge({ status, statusMap, label, className }: StatusBadgeProps) {
    const variant = getStatusVariant(status, statusMap);
    const displayLabel = label || getStatusLabel(status);

    // Map custom variants to standard Badge variants
    // 'success' and 'warning' are custom variants, map them appropriately
    const badgeVariant = variant === 'success' ? 'default' : variant === 'warning' ? 'secondary' : variant;

    return (
        <Badge variant={badgeVariant} className={className}>
            {displayLabel}
        </Badge>
    );
}

export default StatusBadge;
