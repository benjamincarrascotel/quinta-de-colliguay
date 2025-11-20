import '@/../css/components/data-table.css';
import { FilterDefinition, Paginated } from '@/types';
import type { RouteDefinition } from '@/wayfinder';
import { router } from '@inertiajs/react';
import { Typography } from '@mui/material';
import {
    DataGrid,
    GridColDef,
    GridFilterModel,
    GridPaginationModel,
    GridRenderCellParams,
    GridSortModel,
    GridValidRowModel,
    useGridApiRef,
} from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActiveFilters, DataTableContext, DataTableContextValue, useFormWithFiltersFactory } from './data-table-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export type AppGridColDef<T extends GridValidRowModel> = GridColDef<T>;

export type DataTableAction<T> = {
    id: string;
    render: (row: T) => ReactNode;
};

interface ResourceRouteBuilders<T> {
    index: RouteDefinition<'get'>;
    update?: (row: T) => string;
    destroy?: (row: T) => string;
}

interface DataTableProps<T extends { id: number }> {
    data: Paginated<T>;
    columns: AppGridColDef<T>[];
    resourceRoutes: ResourceRouteBuilders<T>;
    filterDefinitions?: FilterDefinition[];
    actions?: DataTableAction<T>[];
    title?: string | React.ReactNode;
    ensureQueryParams?: Record<string, string | number | boolean>;
}

type QueryState<T extends { id: number }> = {
    page: number;
    perPage: number;
    sortModel: GridSortModel;
    columnFilterModel: GridFilterModel;
    customFilters: ActiveFilters;
    resourceRoutes: ResourceRouteBuilders<T>;
};

const getSearchParams = () => {
    if (typeof window === 'undefined') {
        return new URLSearchParams();
    }

    return new URLSearchParams(window.location.search);
};

const extractFilterParams = () => {
    const params = getSearchParams();
    const filters: ActiveFilters = {};

    params.forEach((value, key) => {
        const match = key.match(/^filter\[(.+)\]$/);

        if (match && value) {
            filters[match[1]] = value;
        }
    });

    return filters;
};

const getInitialSortModel = (): GridSortModel => {
    const params = getSearchParams();
    const sort = params.get('sort');

    if (!sort) {
        return [];
    }

    const isDesc = sort.startsWith('-');
    const field = isDesc ? sort.slice(1) : sort;

    if (!field) {
        return [];
    }

    return [
        {
            field,
            sort: isDesc ? 'desc' : 'asc',
        },
    ];
};

const getInitialCustomFilters = (filterDefinitions?: FilterDefinition[]): ActiveFilters => {
    if (!filterDefinitions || filterDefinitions.length === 0) {
        return {};
    }

    const filtersFromUrl = extractFilterParams();
    const initial: ActiveFilters = {};

    filterDefinitions.forEach((definition) => {
        const valueFromUrl = filtersFromUrl[definition.key];

        if (valueFromUrl) {
            initial[definition.key] = valueFromUrl;
            return;
        }

        if (definition.defaultValue) {
            initial[definition.key] = definition.defaultValue;
        }
    });

    return initial;
};

const getInitialColumnFilterModel = (filterDefinitions?: FilterDefinition[]): GridFilterModel => {
    const filtersFromUrl = extractFilterParams();
    const model: GridFilterModel = { items: [] };

    Object.entries(filtersFromUrl).forEach(([key, value]) => {
        const isCustomFilter = filterDefinitions?.some((definition) => definition.key === key);

        if (!isCustomFilter) {
            model.items.push({ field: key, operator: 'contains', value });
        }
    });

    return model.items.length > 0 ? model : { items: [] };
};

const mergeFilters = (columnFilterModel: GridFilterModel, customFilters: ActiveFilters): ActiveFilters => {
    const filters: ActiveFilters = {};

    columnFilterModel.items.forEach((item) => {
        if (item.field && item.value) {
            filters[item.field] = String(item.value);
        }
    });

    Object.entries(customFilters).forEach(([key, value]) => {
        if (value) {
            filters[key] = value;
        }
    });

    return filters;
};

const buildQueryObject = <T extends { id: number }>(state: QueryState<T>): Record<string, string | number> => {
    const query: Record<string, string | number> = {
        page: state.page,
        perPage: state.perPage,
    };

    if (state.sortModel.length > 0) {
        const [{ field, sort }] = state.sortModel;
        query.sort = `${sort === 'desc' ? '-' : ''}${field}`;
    }

    state.columnFilterModel.items.forEach((item) => {
        if (item.field && item.value) {
            query[`filter[${item.field}]`] = String(item.value);
        }
    });

    Object.entries(state.customFilters).forEach(([key, value]) => {
        if (value) {
            query[`filter[${key}]`] = value;
        }
    });

    return query;
};

export default function DataTable<T extends { id: number }>({
    data,
    columns,
    resourceRoutes,
    filterDefinitions,
    actions,
    title,
    ensureQueryParams,
}: DataTableProps<T>) {
    const { data: rows, meta } = data;
    const apiRef = useGridApiRef();

    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>(() => ({
        page: Math.max((meta?.current_page ?? 1) - 1, 0),
        pageSize: meta?.per_page ?? 10,
    }));

    // Sync pagination when new server data arrives (after mutations)
    useEffect(() => {
        setPaginationModel({
            page: Math.max((meta?.current_page ?? 1) - 1, 0),
            pageSize: meta?.per_page ?? 10,
        });
    }, [meta?.current_page, meta?.per_page]);

    const [sortModel, setSortModel] = useState<GridSortModel>(() => getInitialSortModel());
    const [filterModel, setFilterModel] = useState<GridFilterModel>(() => getInitialColumnFilterModel(filterDefinitions));
    const [customFilters, setCustomFilters] = useState<ActiveFilters>(() => getInitialCustomFilters(filterDefinitions));

    const queryState = useMemo<QueryState<T>>(
        () => ({
            page: paginationModel.page + 1,
            perPage: paginationModel.pageSize,
            sortModel,
            columnFilterModel: filterModel,
            customFilters,
            resourceRoutes,
        }),
        [paginationModel, sortModel, filterModel, customFilters, resourceRoutes],
    );

    const activeFilters = useMemo(() => mergeFilters(filterModel, customFilters), [filterModel, customFilters]);

    const useFormWithFilters = useFormWithFiltersFactory(activeFilters);

    const normalizedEnsureQuery = useMemo(() => {
        if (!ensureQueryParams) {
            return {} as Record<string, string>;
        }

        const normalizeValue = (value: string | number | boolean): string => {
            if (typeof value === 'boolean') {
                return value ? '1' : '0';
            }

            return String(value);
        };

        return Object.fromEntries(Object.entries(ensureQueryParams).map(([key, value]) => [key, normalizeValue(value)]));
    }, [ensureQueryParams]);

    const baseQueryParams = useMemo(() => {
        if (typeof window === 'undefined') {
            return {} as Record<string, string>;
        }

        try {
            const url = new URL(resourceRoutes.index.url, window.location.origin);
            const params: Record<string, string> = {};
            url.searchParams.forEach((value, key) => {
                params[key] = value;
            });
            return params;
        } catch {
            return {} as Record<string, string>;
        }
    }, [resourceRoutes.index.url]);

    const initialQueryEnsuredRef = useRef(false);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        if (initialQueryEnsuredRef.current) {
            return;
        }

        if (!normalizedEnsureQuery || Object.keys(normalizedEnsureQuery).length === 0) {
            initialQueryEnsuredRef.current = true;
            return;
        }

        const currentParams = new URLSearchParams(window.location.search);
        const needsEnsure = Object.entries(normalizedEnsureQuery).some(([key, value]) => currentParams.get(key) !== value);

        if (!needsEnsure) {
            initialQueryEnsuredRef.current = true;
            return;
        }

        const mergedParams: Record<string, string> = {};
        currentParams.forEach((value, key) => {
            mergedParams[key] = value;
        });

        Object.entries(normalizedEnsureQuery).forEach(([key, value]) => {
            mergedParams[key] = value;
        });

        initialQueryEnsuredRef.current = true;

        router.get(resourceRoutes.index.url, mergedParams, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, [normalizedEnsureQuery, resourceRoutes.index.url]);

    useEffect(() => {
        if (apiRef.current && actions && actions.length > 0 && rows.length > 0) {
            // Delay to ensure the DOM is rendered
            const timer = setTimeout(() => {
                apiRef.current?.autosizeColumns({
                    columns: ['__actions__'],
                    includeHeaders: true,
                    includeOutliers: true,
                });
            }, 100);

            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [actions, rows]);

    const navigate = useCallback(
        (partialState: Partial<QueryState<T>> = {}) => {
            const nextState: QueryState<T> = {
                ...queryState,
                ...partialState,
                sortModel: partialState.sortModel ?? queryState.sortModel,
                columnFilterModel: partialState.columnFilterModel ?? queryState.columnFilterModel,
                customFilters: partialState.customFilters ?? queryState.customFilters,
                page: partialState.page ?? queryState.page,
                perPage: partialState.perPage ?? queryState.perPage,
            };

            const query = buildQueryObject(nextState);
            const mergedQuery = { ...baseQueryParams, ...normalizedEnsureQuery, ...query };

            router.get(resourceRoutes.index.url, mergedQuery, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        },
        [baseQueryParams, normalizedEnsureQuery, queryState, resourceRoutes.index.url],
    );

    const refresh = useCallback(() => {
        navigate();
    }, [navigate]);

    const patchWithFilters = useCallback<DataTableContextValue['patchWithFilters']>(
        (url, options = {}) => {
            const { data: requestData, preserveScroll = true, preserveState = true, ...rest } = options;

            router.visit(url, {
                method: 'patch',
                data: {
                    ...(requestData ?? {}),
                    filters: activeFilters,
                },
                preserveScroll,
                preserveState,
                ...rest,
            });
        },
        [activeFilters],
    );

    const deleteWithFilters = useCallback<DataTableContextValue['deleteWithFilters']>(
        (url, options = {}) => {
            const { data: requestData, preserveScroll = true, ...rest } = options;

            router.delete(url, {
                data: {
                    ...(requestData ?? {}),
                    filters: activeFilters,
                },
                preserveScroll,
                ...rest,
            });
        },
        [activeFilters],
    );

    const contextValue = useMemo<DataTableContextValue>(
        () => ({
            activeFilters,
            refresh,
            patchWithFilters,
            deleteWithFilters,
            useFormWithFilters,
        }),
        [activeFilters, refresh, patchWithFilters, deleteWithFilters, useFormWithFilters],
    );

    const handlePaginationModelChange = useCallback(
        (model: GridPaginationModel) => {
            setPaginationModel(model);
            navigate({ page: model.page + 1, perPage: model.pageSize });
        },
        [navigate],
    );

    const handleSortModelChange = useCallback(
        (model: GridSortModel) => {
            setSortModel(model);
            setPaginationModel((previous) => ({ ...previous, page: 0 }));
            navigate({ sortModel: model, page: 1 });
        },
        [navigate],
    );

    const handleFilterModelChange = useCallback(
        (model: GridFilterModel) => {
            setFilterModel(model);
            setPaginationModel((previous) => ({ ...previous, page: 0 }));
            navigate({ columnFilterModel: model, page: 1 });
        },
        [navigate],
    );

    const handleCustomFilterChange = useCallback(
        (filterKey: string, selectedValue: string) => {
            const normalizedValue = selectedValue === 'all' ? '' : selectedValue;
            const nextFilters = { ...customFilters };

            if (!normalizedValue) {
                delete nextFilters[filterKey];
            } else {
                nextFilters[filterKey] = normalizedValue;
            }

            // Clear dependent filters when the parent filter changes
            filterDefinitions?.forEach((filter) => {
                if (filter.dependsOn === filterKey) {
                    delete nextFilters[filter.key];
                }
            });

            setCustomFilters(nextFilters);
            setPaginationModel((previous) => ({ ...previous, page: 0 }));
            navigate({ customFilters: nextFilters, page: 1 });
        },
        [customFilters, navigate, filterDefinitions],
    );

    const processedColumns = useMemo<GridColDef<T>[]>(() => {
        return columns.map((originalColumn) => {
            const gridColumn: GridColDef<T> = {
                ...originalColumn,
                minWidth: originalColumn.minWidth ?? 150,
                flex: originalColumn.flex ?? 1,
            };

            return gridColumn;
        });
    }, [columns]);

    const columnsWithActions = useMemo<GridColDef<T>[]>(() => {
        if (!actions || actions.length === 0) {
            return processedColumns;
        }

        const actionColumn: GridColDef<T> = {
            field: '__actions__',
            headerName: 'Acciones',
            sortable: false,
            filterable: false,
            flex: 0,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params: GridRenderCellParams<T>) => (
                <div className="flex h-full w-full flex-wrap items-center justify-center gap-2">
                    {actions.map((action) => (
                        <span key={action.id}>{action.render(params.row)}</span>
                    ))}
                </div>
            ),
        };

        return [...processedColumns, actionColumn];
    }, [actions, processedColumns]);

    return (
        <DataTableContext.Provider value={contextValue}>
            <div className="data-table-wrapper">
                {title && (
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                        {title}
                    </Typography>
                )}

                {filterDefinitions && filterDefinitions.length > 0 && (
                    <div className="mb-4 flex w-full flex-wrap items-center gap-4">
                        {filterDefinitions.map((filter) => {
                            const isDisabled = !!(filter.dependsOn && !customFilters[filter.dependsOn]);

                            return (
                                <Select
                                    key={filter.key}
                                    value={customFilters[filter.key] || ''}
                                    onValueChange={(selected) => handleCustomFilterChange(filter.key, selected)}
                                    disabled={isDisabled}
                                >
                                    <SelectTrigger className="w-full sm:w-[320px]">
                                        <SelectValue placeholder={filter.placeholder} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filter.allowClear !== false && (
                                            <SelectItem value="all">
                                                <em>Todos</em>
                                            </SelectItem>
                                        )}
                                        {filter.options.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            );
                        })}
                    </div>
                )}

                <div className="data-table-scroll-container">
                    <DataGrid
                        apiRef={apiRef}
                        sx={{
                            '& .MuiDataGrid-main': {
                                overflow: 'unset !important',
                            },
                            '& .MuiDataGrid-virtualScroller': {
                                overflow: 'unset !important',
                            },
                            '& .MuiDataGrid-cell': {
                                whiteSpace: 'normal !important',
                                wordBreak: 'normal !important',
                                overflowWrap: 'break-word !important',
                                padding: '0.5rem',
                                alignContent: 'center',
                                textOverflow: 'clip !important',
                            },
                            '& .MuiDataGrid-columnHeader': {
                                whiteSpace: 'normal !important',
                                wordBreak: 'normal !important',
                                overflowWrap: 'break-word !important',
                            },
                            '& .MuiDataGrid-columnHeaderTitle': {
                                whiteSpace: 'normal !important',
                                wordBreak: 'normal !important',
                                overflowWrap: 'break-word !important',
                                textOverflow: 'clip !important',
                                overflow: 'visible !important',
                            },
                            '& .MuiDataGrid-columnHeader:last-of-type .MuiDataGrid-columnSeparator': {
                                display: 'none',
                            },
                            '& .MuiDataGrid-filler': {
                                borderLeft: 'none',
                            },
                        }}
                        getRowHeight={() => 'auto'}
                        rows={rows}
                        columns={columnsWithActions}
                        rowCount={meta?.total ?? 0}
                        pageSizeOptions={[paginationModel.pageSize]}
                        paginationModel={paginationModel}
                        paginationMode="server"
                        onPaginationModelChange={handlePaginationModelChange}
                        sortingMode="server"
                        onSortModelChange={handleSortModelChange}
                        filterMode="server"
                        onFilterModelChange={handleFilterModelChange}
                        getRowId={(row) => row.id}
                        localeText={esES.components.MuiDataGrid.defaultProps.localeText}
                        autoHeight
                    />
                </div>
            </div>
        </DataTableContext.Provider>
    );
}
