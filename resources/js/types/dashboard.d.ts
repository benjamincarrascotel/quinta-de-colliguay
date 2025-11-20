export interface DashboardFilters {
    startDate?: string;
    endDate?: string;
    companyId: number | null;
    productionCenterId: number | null;
}

export interface DashboardMetric {
    label: string;
    value: number | string;
}

export interface DashboardPageProps extends Record<string, unknown> {
    companies: Array<{ id: number; name: string }>;
    productionCenters: Record<number, Array<{ id: number; name: string; company_id: number }>>;
    filters: DashboardFilters;
    metrics?: DashboardMetric[];
}
