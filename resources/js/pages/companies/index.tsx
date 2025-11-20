import { CompaniesTableActions } from '@/components/companies/CompaniesTableActions';
import DataTable, { AppGridColDef, DataTableAction } from '@/components/data-table';
import AppLayout from '@/layouts/app-layout';
import ModuleLayout from '@/layouts/module-layout';
import * as companyRoutes from '@/routes/companies';
import { BreadcrumbItem, Company, FilterDefinition, NavItem, PageProps, Paginated } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { getGridStringOperators } from '@mui/x-data-grid';
import { useMemo } from 'react';

const filterOperators = getGridStringOperators().filter((operator) => operator.value === 'contains');

const companiesIndexRoute = companyRoutes.index({
    query: {
        with_form_data: true,
    },
});

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Compañías',
        href: '#',
    },
    {
        title: 'Listado',
        href: companiesIndexRoute.url,
    },
];

const navItems: NavItem[] = [
    {
        title: 'Listado',
        href: companiesIndexRoute.url,
        icon: null,
    },
    {
        title: 'Crear Nueva',
        href: companyRoutes.create().url,
        icon: null,
    },
];

export default function CompaniesIndex() {
    const { props } = usePage<PageProps<{ companies: Paginated<Company>; isActiveFilter: boolean | null }>>();
    const { companies, isActiveFilter } = props;

    const columns = useMemo<AppGridColDef<Company>[]>(() => {
        return [
            { field: 'name', headerName: 'Nombre', filterable: true, filterOperators },
            {
                field: 'is_active',
                headerName: 'Estado',
                filterable: false,
                sortable: false,
                valueFormatter: (value: boolean) => (value ? 'Activa' : 'Inactiva'),
            },
            {
                field: 'created_at',
                headerName: 'Fecha de Creación',
                filterable: false,
                sortable: true,
                valueFormatter: (value: string) => new Date(value).toLocaleDateString(),
            },
        ];
    }, []);

    const actions = useMemo<DataTableAction<Company>[]>(
        () => [
            {
                id: 'company-actions',
                render: (row) => <CompaniesTableActions company={row} />,
            },
        ],
        [],
    );

    const subtitle = useMemo(() => {
        if (isActiveFilter === false) {
            return 'Compañías inactivas del sistema';
        }
        return 'Compañías activas del sistema';
    }, [isActiveFilter]);

    const filterDefinitions = useMemo<FilterDefinition[]>(() => {
        return [
            {
                key: 'is_active',
                placeholder: 'Selecciona el estado',
                options: [
                    { value: '1', label: 'Activas' },
                    { value: '0', label: 'Inactivas' },
                ],
                defaultValue: '1',
                allowClear: false,
            },
        ];
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Compañías" />
            <ModuleLayout title="Compañías" description="Administración de compañías del sistema." navItems={navItems}>
                <DataTable
                    data={companies}
                    columns={columns}
                    resourceRoutes={{
                        index: companiesIndexRoute,
                        update: (company) => companyRoutes.update({ company: company.id }).url,
                        destroy: (company) => companyRoutes.destroy({ company: company.id }).url,
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
