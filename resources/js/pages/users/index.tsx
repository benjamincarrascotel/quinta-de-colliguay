import DataTable, { AppGridColDef, DataTableAction } from '@/components/data-table';
import { UsersTableActions } from '@/components/users/UsersTableActions';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/layouts/app-layout';
import ModuleLayout from '@/layouts/module-layout';
import * as userRoutes from '@/routes/users';
import { BreadcrumbItem, Company, FilterDefinition, NavItem, PageProps, Paginated, ProductionCenter, Role, User } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { GridRenderCellParams, getGridStringOperators } from '@mui/x-data-grid';
import { useMemo } from 'react';

const filterOperators = getGridStringOperators().filter((operator) => operator.value === 'contains');

const usersIndexRoute = userRoutes.index({
    query: {
        with_form_data: true,
    },
});

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Usuarios',
        href: '#',
    },
    {
        title: 'Listado',
        href: usersIndexRoute.url,
    },
];

const navItems: NavItem[] = [
    {
        title: 'Listado',
        href: usersIndexRoute.url,
        icon: null,
    },
    {
        title: 'Crear Nuevo',
        href: userRoutes.create().url,
        icon: null,
    },
    {
        title: 'Cambiar Contraseña',
        href: userRoutes.changePasswordForm().url,
        icon: null,
    },
];

type ProductionCentersByCompany = Record<string, ProductionCenter[]>;

export default function UsersIndex() {
    const {
        props: { users, companies, productionCenters, filteredCompany },
    } = usePage<
        PageProps<{
            users: Paginated<User>;
            roles: Role[];
            companies: Company[];
            productionCenters: ProductionCentersByCompany;
            filteredCompany: Company | null;
        }>
    >();
    const { isSuperAdmin, isAdmin } = useAuth();

    const columns = useMemo<AppGridColDef<User>[]>(() => {
        const baseColumns: AppGridColDef<User>[] = [
            {
                field: 'name',
                headerName: 'Usuario',
                filterable: true,
                filterOperators,
                renderCell: (params: GridRenderCellParams<User>) => (
                    <div>
                        <p>
                            {params.row.name} {params.row.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{params.row.email}</p>
                    </div>
                ),
            },
            { field: 'phone_number', headerName: 'Teléfono', filterable: true, sortable: true, filterOperators },
            {
                field: 'role',
                headerName: 'Cargo',
                filterable: true,
                sortable: true,
                filterOperators,
            },
        ];

        if (isSuperAdmin && !filteredCompany) {
            return [
                {
                    field: 'company.name',
                    headerName: 'Compañía',
                    filterable: true,
                    sortable: true,
                    renderCell: (params: GridRenderCellParams<User>) => params.row.company?.name || '',
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
            return 'Todos los usuarios del sistema';
        }
        return 'Usuarios de tu compañía';
    }, [filteredCompany, isSuperAdmin]);

    const filterDefinitions = useMemo<FilterDefinition[]>(() => {
        const filters: FilterDefinition[] = [];

        // Company filter (superadmin only)
        if (isSuperAdmin) {
            filters.push({
                key: 'company_id',
                placeholder: 'Selecciona una compañía',
                options: companies.map((company) => ({
                    value: company.id.toString(),
                    label: company.name,
                })),
            });
        }

        // Production center filter
        const availableProductionCenters = filteredCompany
            ? productionCenters[filteredCompany.id] || []
            : isAdmin && companies.length > 0
              ? productionCenters[companies[0].id] || []
              : [];

        // Always show the production center filter
        filters.push({
            key: 'production_center_id',
            placeholder: 'Selecciona un centro de producción',
            options: availableProductionCenters.map((center) => ({
                value: center.id.toString(),
                label: center.name,
            })),
            dependsOn: isSuperAdmin ? 'company_id' : undefined,
        });

        return filters;
    }, [companies, productionCenters, filteredCompany, isSuperAdmin, isAdmin]);

    const actions = useMemo<DataTableAction<User>[]>(
        () => [
            {
                id: 'user-actions',
                render: (row) => <UsersTableActions user={row} />,
            },
        ],
        [],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Usuarios" />
            <ModuleLayout title="Usuarios" description="Administración de usuarios del sistema." navItems={navItems}>
                <DataTable
                    data={users}
                    columns={columns}
                    resourceRoutes={{
                        index: usersIndexRoute,
                        update: (row) => userRoutes.update({ user: String(row.id) }).url,
                        destroy: (row) => userRoutes.destroy({ user: String(row.id) }).url,
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
