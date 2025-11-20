import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DASHBOARD_PADDING } from '../utils/dashboard-shared-styles';

type FilterType = 'select' | 'date' | 'dateRange' | 'multiSelect' | 'text';

export interface FilterOption {
    value: string | number;
    label: string;
}

export interface FilterDefinition {
    key: string;
    label: string;
    type: FilterType;
    options?: FilterOption[];
    placeholder?: string;
    dependsOn?: string;
    fetchOptions?: (parentValue: string | number | null) => Promise<FilterOption[]>;
    visible?: boolean;
    defaultValue?: string | number | Date | null | (string | number)[];
    width?: string;
}

interface DashboardFilterBarProps {
    filters: FilterDefinition[];
    values: Record<string, string | number | null | (string | number)[]>;
    onChange: (values: Record<string, string | number | null | (string | number)[]>) => void;
    onApply?: () => void;
    autoApply?: boolean;
    className?: string;
}

/**
 * DashboardFilterBar - Generic, parametrizable filter component
 *
 * Supports:
 * - Multiple filter types (select, date, dateRange, text, multiSelect)
 * - Cascading filters with dependsOn
 * - Async option loading
 * - Auto-reset of dependent filters
 * - Manual or automatic application
 *
 * @param {FilterDefinition[]} filters - Filter definitions
 * @param {Record<string, any>} values - Current filter values
 * @param {Function} onChange - Callback when filters change
 * @param {Function} [onApply] - Manual apply callback
 * @param {boolean} [autoApply=true] - Auto-apply changes
 * @param {string} [className] - Additional CSS classes
 *
 * @example
 * // Basic filter bar
 * <DashboardFilterBar
 *   filters={[
 *     {key: 'company', label: 'Company', type: 'select', options: companies},
 *     {key: 'status', label: 'Status', type: 'select', options: statuses}
 *   ]}
 *   values={filters}
 *   onChange={setFilters}
 * />
 *
 * @example
 * // With cascading filters
 * <DashboardFilterBar
 *   filters={[
 *     {key: 'company', label: 'Company', type: 'select', options: companies},
 *     {
 *       key: 'productionCenter',
 *       label: 'Production Center',
 *       type: 'select',
 *       dependsOn: 'company',
 *       fetchOptions: async (companyId) => {
 *         const res = await fetch(`/api/centers?company=${companyId}`);
 *         return res.json();
 *       }
 *     }
 *   ]}
 *   values={filters}
 *   onChange={setFilters}
 * />
 */
export function DashboardFilterBar({ filters, values, onChange, onApply, autoApply = true, className }: DashboardFilterBarProps) {
    const [localValues, setLocalValues] = useState(values);
    const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());
    const [dynamicOptions, setDynamicOptions] = useState<Record<string, FilterOption[]>>({});

    // Normalize filter value
    const normalizeValue = (
        val: string | number | Date | null | (string | number)[],
        type: FilterType,
    ): string | number | null | (string | number)[] => {
        if (val === null || val === undefined) return null;
        if (val instanceof Date) {
            return val.toISOString().split('T')[0]; // yyyy-mm-dd format
        }
        if (type === 'select') return String(val);
        if (type === 'multiSelect') return Array.isArray(val) ? val : [val];
        return val;
    };

    // Handle filter change
    const handleFilterChange = (key: string, value: string | number | Date | null | (string | number)[]) => {
        const normalized = normalizeValue(value, filters.find((f) => f.key === key)?.type || 'select');
        const newValues = { ...localValues, [key]: normalized };

        // Reset dependent filters
        filters.forEach((filter) => {
            if (filter.dependsOn === key) {
                newValues[filter.key] = null;
            }
        });

        setLocalValues(newValues);

        // Fetch dynamic options for dependent filters
        filters.forEach((filter) => {
            if (filter.dependsOn === key && filter.fetchOptions && normalized) {
                loadDynamicOptions(filter, normalized as string | number);
            }
        });

        if (autoApply) {
            onChange(newValues);
        }
    };

    // Load dynamic options
    const loadDynamicOptions = useCallback(async (filter: FilterDefinition, parentValue: string | number | null) => {
        if (!filter.fetchOptions) return;

        setLoadingKeys((prev) => new Set([...prev, filter.key]));

        try {
            const options = await filter.fetchOptions(parentValue);
            setDynamicOptions((prev) => ({ ...prev, [filter.key]: options }));
        } catch (error) {
            console.error(`Error loading options for ${filter.key}:`, error);
        } finally {
            setLoadingKeys((prev) => {
                const next = new Set(prev);
                next.delete(filter.key);
                return next;
            });
        }
    }, []);

    // Initialize dynamic options on mount
    useEffect(() => {
        filters.forEach((filter) => {
            if (filter.fetchOptions && filter.dependsOn && values[filter.dependsOn]) {
                loadDynamicOptions(filter, values[filter.dependsOn] as string | number | null);
            }
        });
    }, [filters, values, loadDynamicOptions]);

    // Sync prop changes
    useEffect(() => {
        const newValues = { ...values };
        setLocalValues(newValues);
    }, [values]);

    // Get visible filters
    const visibleFilters = useMemo(() => {
        return filters.filter((f) => f.visible !== false);
    }, [filters]);

    // Get options for filter
    const getFilterOptions = (filter: FilterDefinition): FilterOption[] => {
        const allOption = { value: 'all', label: filter.placeholder || 'Todos' };

        if (dynamicOptions[filter.key]) {
            return [allOption, ...dynamicOptions[filter.key]];
        }

        // Check if filter depends on another
        if (filter.dependsOn) {
            const parentValue = localValues[filter.dependsOn];
            if (!parentValue) {
                return [];
            }
        }

        const options = filter.options || [];
        return [allOption, ...options];
    };

    const handleApply = () => {
        onChange(localValues);
        if (onApply) {
            onApply();
        }
    };

    const hasChanges = JSON.stringify(localValues) !== JSON.stringify(values);

    return (
        <div className={cn('rounded-lg border border-border bg-card', DASHBOARD_PADDING.sm, className)}>
            <div className="flex w-full flex-wrap items-end gap-4">
                {visibleFilters.map((filter) => (
                    <div key={filter.key} className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-foreground">{filter.label}</label>

                        {/* Select Filter */}
                        {filter.type === 'select' && (
                            <Select
                                value={localValues[filter.key]?.toString() || 'all'}
                                onValueChange={(value) => handleFilterChange(filter.key, value === 'all' ? null : value)}
                                disabled={loadingKeys.has(filter.key)}
                            >
                                <SelectTrigger className="w-full sm:w-[320px]">
                                    <SelectValue placeholder={filter.placeholder || 'Select...'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {getFilterOptions(filter).map((option) => (
                                        <SelectItem key={option.value} value={option.value.toString()}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        {/* Date Filter */}
                        {filter.type === 'date' && (
                            <Input
                                type="date"
                                value={(localValues[filter.key] as string) || ''}
                                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                                onClick={(e) => e.currentTarget.showPicker?.()}
                                className={cn('w-full', filter.width ? filter.width : 'sm:w-[200px]')}
                            />
                        )}

                        {/* Date Range Filter */}
                        {filter.type === 'dateRange' && (
                            <div className="flex gap-2">
                                <Input
                                    type="date"
                                    value={(localValues[`${filter.key}Start`] as string) || ''}
                                    onChange={(e) => handleFilterChange(`${filter.key}Start`, e.target.value)}
                                    onClick={(e) => e.currentTarget.showPicker?.()}
                                    placeholder="Start date"
                                    className="w-full sm:w-[200px]"
                                />
                                <Input
                                    type="date"
                                    value={(localValues[`${filter.key}End`] as string) || ''}
                                    onChange={(e) => handleFilterChange(`${filter.key}End`, e.target.value)}
                                    onClick={(e) => e.currentTarget.showPicker?.()}
                                    placeholder="End date"
                                    className="w-full sm:w-[200px]"
                                />
                            </div>
                        )}

                        {/* Text Filter */}
                        {filter.type === 'text' && (
                            <Input
                                type="text"
                                value={String(localValues[filter.key] || '')}
                                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                                placeholder={filter.placeholder || 'Type...'}
                                className="w-full sm:w-[320px]"
                            />
                        )}

                        {/* Loading indicator */}
                        {loadingKeys.has(filter.key) && (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        )}
                    </div>
                ))}

                {/* Action Buttons */}
                <div className="flex gap-2">
                    {!autoApply && (
                        <Button onClick={handleApply} disabled={!hasChanges} size="sm">
                            Apply
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DashboardFilterBar;
