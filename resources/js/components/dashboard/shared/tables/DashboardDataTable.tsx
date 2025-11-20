import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import { COMPONENT_CLASSES, DASHBOARD_TEXT } from '../utils/dashboard-shared-styles';
import type { ColumnDefinition } from '../utils/dashboard-types';

interface DashboardDataTableProps<T> {
    data: T[];
    columns: ColumnDefinition<T>[];
    loading?: boolean;
    emptyMessage?: string;
    className?: string;
    striped?: boolean;
    hover?: boolean;
    rowKey?: (row: T) => string | number;
}

/**
 * DashboardDataTable - Flexible table component with nested row support
 *
 * A reusable table component that supports:
 * - Nested/hierarchical rows (expandable)
 * - Custom cell rendering
 * - Loading and empty states
 * - Striped rows and hover effects
 * - Responsive design
 *
 * @param {T[]} data - Table data array
 * @param {ColumnDefinition<T>[]} columns - Column definitions with render functions
 * @param {boolean} [loading] - Show loading state
 * @param {string} [emptyMessage] - Message when no data
 * @param {string} [className] - Additional CSS classes
 * @param {boolean} [striped=false] - Alternate row backgrounds
 * @param {boolean} [hover=true] - Show hover effect
 * @param {Function} [rowKey] - Function to get unique row key
 *
 * @example
 * // Basic table
 * <DashboardDataTable
 *   data={machines}
 *   columns={[
 *     {key: 'name', header: 'Machine Name'},
 *     {key: 'status', header: 'Status', render: (row) => <Badge>{row.status}</Badge>}
 *   ]}
 * />
 *
 * @example
 * // Table with nested rows
 * <DashboardDataTable
 *   data={categories}
 *   columns={[
 *     {
 *       key: 'category',
 *       header: 'Category',
 *       nestedRows: {
 *         getData: (row) => row.machines,
 *         columns: machineColumns,
 *         expandable: true
 *       }
 *     }
 *   ]}
 * />
 */
export function DashboardDataTable<T extends Record<string, unknown>>({
    data,
    columns,
    loading = false,
    emptyMessage = 'No data available',
    className,
    striped = false,
    hover = true,
    rowKey,
}: DashboardDataTableProps<T>) {
    const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set());

    const toggleRow = (key: string | number) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(key)) {
            newExpanded.delete(key);
        } else {
            newExpanded.add(key);
        }
        setExpandedRows(newExpanded);
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className={cn(DASHBOARD_TEXT.label, 'text-muted-foreground')}>Loading data...</p>
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="flex justify-center py-12">
                <p className={cn(DASHBOARD_TEXT.description)}>{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className={cn('overflow-x-auto', className)}>
            <table className="w-full border-collapse">
                <thead>
                    <tr className={cn(COMPONENT_CLASSES.tableHeader)}>
                        {columns.map((column) => (
                            <th key={column.key} className={cn('px-4 py-3 text-left text-sm font-semibold text-foreground', column.className)}>
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => {
                        const key = rowKey ? rowKey(row) : rowIndex;
                        const isExpanded = expandedRows.has(key);
                        const hasNested = columns.some((col) => col.nestedRows);

                        return (
                            <React.Fragment key={key}>
                                {/* Main row */}
                                <tr
                                    className={cn(
                                        COMPONENT_CLASSES.tableRow,
                                        hover && 'transition-colors hover:bg-muted/20',
                                        striped && rowIndex % 2 === 0 && COMPONENT_CLASSES.stripedTable,
                                    )}
                                >
                                    {columns.map((column) => (
                                        <td key={`${key}-${column.key}`} className={cn('px-4 py-3 text-sm text-foreground', column.className)}>
                                            {column.nestedRows ? (
                                                <button
                                                    onClick={() => toggleRow(key)}
                                                    className="inline-flex items-center gap-2 text-foreground transition-colors hover:text-primary"
                                                >
                                                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                    {column.render ? column.render(row) : String(row[column.key] || '—')}
                                                </button>
                                            ) : column.render ? (
                                                column.render(row)
                                            ) : (
                                                String(row[column.key] || '—')
                                            )}
                                        </td>
                                    ))}
                                </tr>

                                {/* Nested rows */}
                                {hasNested &&
                                    columns.map((column) => {
                                        if (!column.nestedRows) return null;

                                        const nestedData = column.nestedRows.getData(row);
                                        const shouldShow = column.nestedRows.expandable && column.nestedRows.defaultExpanded ? true : isExpanded;

                                        if (!shouldShow || !nestedData || nestedData.length === 0) {
                                            return null;
                                        }

                                        return nestedData.map((nestedRow, nestedIndex) => {
                                            const nestedRowObj = nestedRow as Record<string, unknown>;
                                            return (
                                                <tr
                                                    key={`${key}-nested-${nestedIndex}`}
                                                    className={cn(
                                                        COMPONENT_CLASSES.tableRow,
                                                        'bg-muted/10',
                                                        hover && 'transition-colors hover:bg-muted/20',
                                                    )}
                                                >
                                                    {column.nestedRows?.columns.map((nestedColumn) => (
                                                        <td
                                                            key={`${key}-nested-${nestedIndex}-${nestedColumn.key}`}
                                                            className={cn('px-4 py-2 pl-12 text-sm text-muted-foreground', nestedColumn.className)}
                                                        >
                                                            {nestedColumn.render
                                                                ? nestedColumn.render(nestedRow)
                                                                : String(nestedRowObj[nestedColumn.key] || '—')}
                                                        </td>
                                                    ))}
                                                    {/* Fill remaining columns */}
                                                    {columns.map((col, colIdx) => colIdx > 0 && <td key={`fill-${colIdx}`} className="px-4 py-2" />)}
                                                </tr>
                                            );
                                        });
                                    })}
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default DashboardDataTable;
