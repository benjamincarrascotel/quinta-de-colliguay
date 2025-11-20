import DataTable, { AppGridColDef, DataTableAction } from '@/components/data-table';
import { ProductionCentersTableActions } from '@/components/production-centers/ProductionCentersTableActions';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/layouts/app-layout';
import ModuleLayout from '@/layouts/module-layout';
import * as productionCenterRoutes from '@/routes/production_centers';
import { BreadcrumbItem, Company, FilterDefinition, NavItem, PageProps, Paginated, ProductionCenter } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { GridRenderCellParams, getGridStringOperators } from '@mui/x-data-grid';
import { useMemo } from 'react';

const filterOperators = getGridStringOperators().filter((operator) => operator.value === 'contains');

const productionCentersIndexRoute = productionCenterRoutes.index({
    query: {
        with_form_data: true,
    },
});

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Centros de Producción',
        href: '#',
    },
    {
        title: 'Listado',
        href: productionCentersIndexRoute.url,
    },
];

const navItems: NavItem[] = [
    {
        title: 'Listado',
        href: productionCentersIndexRoute.url,
        icon: null,
    },
    {
        title: 'Crear Nuevo',
        href: productionCenterRoutes.create().url,
        icon: null,
    },
];

export default function ProductionCentersIndex() {
    const {
        props: { production_centers, companies, filteredCompany },
    } = usePage<
        PageProps<{
            production_centers: Paginated<ProductionCenter>;
            companies: Company[];
            filteredCompany: Company | null;
        }>
    >();
    const { isSuperAdmin } = useAuth();

    const columns = useMemo<AppGridColDef<ProductionCenter>[]>(() => {
        const baseColumns: AppGridColDef<ProductionCenter>[] = [
            { field: 'name', headerName: 'Nombre', filterable: true, filterOperators },
            {
                field: 'created_at',
                headerName: 'Fecha de Creación',
                filterable: false,
                sortable: true,
                valueFormatter: (value: string) => new Date(value).toLocaleDateString(),
            },
        ];

        if (isSuperAdmin && !filteredCompany) {
            return [
                {
                    field: 'company.name',
                    headerName: 'Compañía',
                    filterable: true,
                    sortable: true,
                    renderCell: (params: GridRenderCellParams<ProductionCenter>) => params.row.company?.name || '',
                    filterOperators,
                },
                ...baseColumns,
            ];
        }

        return baseColumns;
    }, [isSuperAdmin, filteredCompany]);

    const subtitle = useMemo(() => {
        if (filteredCompany) {
            return filteredCompany.name;
        }
        if (isSuperAdmin) {
            return 'Todos los centros de producción';
        }
        return 'Centros de producción de tu compañía';
    }, [filteredCompany, isSuperAdmin]);

    const filterDefinitions = useMemo<FilterDefinition[]>(() => {
        if (!isSuperAdmin) {
            return [];
        }
        return [
            {
                key: 'company_id',
                placeholder: 'Selecciona una compañía',
                options: companies.map((company) => ({
                    value: company.id.toString(),
                    label: company.name,
                })),
            },
        ];
    }, [companies, isSuperAdmin]);

    const actions = useMemo<DataTableAction<ProductionCenter>[]>(
        () => [
            {
                id: 'production-center-actions',
                render: (row) => <ProductionCentersTableActions productionCenter={row} />,
            },
        ],
        [],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Centros de Producción" />
            <ModuleLayout title="Centros de Producción" description="Administración de centros de producción del sistema." navItems={navItems}>
                <DataTable
                    data={production_centers}
                    columns={columns}
                    resourceRoutes={{
                        index: productionCentersIndexRoute,
                        update: (center) => productionCenterRoutes.update({ production_center: Number(center.id) }).url,
                        destroy: (center) => productionCenterRoutes.destroy({ production_center: Number(center.id) }).url,
                    }}
                    title={subtitle}
                    filterDefinitions={filterDefinitions}
                    actions={actions}
                    ensureQueryParams={{ with_form_data: true }}
                />
            </ModuleLayout>
        </AppLayout>
    );
}
