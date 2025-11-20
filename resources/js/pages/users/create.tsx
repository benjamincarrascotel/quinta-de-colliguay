import { useEffect, useMemo } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/layouts/app-layout';
import ModuleLayout from '@/layouts/module-layout';
import * as userRoutes from '@/routes/users';
import { BreadcrumbItem, Company, NavItem, PageProps, ProductionCenter, Role } from '@/types';
import { Head, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Usuarios',
        href: userRoutes.index().url,
    },
    {
        title: 'Crear',
        href: userRoutes.create().url,
    },
];

const navItems: NavItem[] = [
    {
        title: 'Listado',
        href: userRoutes.index().url,
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

type ProductionCentersByCompany = Record<number, ProductionCenter[]>;

export default function UsersCreate({
    roles,
    companies,
    productionCenters,
}: PageProps<{ roles: Role[]; companies: Company[]; productionCenters: ProductionCentersByCompany }>) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role_id: '',
        company_id: '',
        production_center_ids: [] as string[],
        phone: '',
        phone_area_code: '',
    });

    const { user: actor, isAdmin: isActorAdmin, isSuperAdmin } = useAuth();
    const actorCompanyId = actor?.company_id ?? null;

    useEffect(() => {
        if (isActorAdmin && !isSuperAdmin && actorCompanyId && data.company_id !== String(actorCompanyId)) {
            setData('company_id', String(actorCompanyId));
        }
    }, [actorCompanyId, data.company_id, isActorAdmin, isSuperAdmin, setData]);

    const rolesById = useMemo(() => {
        const lookup: Record<string, Role> = {};
        roles.forEach((role) => {
            lookup[String(role.id)] = role;
        });
        return lookup;
    }, [roles]);

    const selectedRole = rolesById[data.role_id] ?? null;
    const selectedRoleName = (selectedRole?.name ?? '').toLowerCase();

    const requiresProductionCenters = ['normal'].includes(selectedRoleName);

    const companiesOptions = useMemo(() => {
        if (isActorAdmin && !isSuperAdmin && actorCompanyId) {
            return companies.filter((company) => company.id === actorCompanyId);
        }

        return companies;
    }, [actorCompanyId, companies, isActorAdmin, isSuperAdmin]);

    const availableProductionCenters = useMemo(() => {
        if (!data.company_id) {
            return [] as ProductionCenter[];
        }

        return productionCenters[Number(data.company_id)] ?? [];
    }, [data.company_id, productionCenters]);

    useEffect(() => {
        // For admins, production centers are always required, so we bypass this effect
        if (isActorAdmin && !isSuperAdmin) {
            return;
        }

        if (!requiresProductionCenters && data.production_center_ids.length > 0) {
            setData('production_center_ids', []);
        }
    }, [data.production_center_ids.length, requiresProductionCenters, setData, isActorAdmin, isSuperAdmin]);

    useEffect(() => {
        if (!data.company_id && data.production_center_ids.length > 0) {
            setData('production_center_ids', []);
            return;
        }

        if (!data.company_id) {
            return;
        }

        const allowedIds = new Set(availableProductionCenters.map((center) => String(center.id)));
        const filtered = data.production_center_ids.filter((id) => allowedIds.has(id));

        if (filtered.length !== data.production_center_ids.length) {
            setData('production_center_ids', filtered);
        }
    }, [availableProductionCenters, data.company_id, data.production_center_ids, setData]);

    const toggleProductionCenter = (centerId: string, checked: boolean) => {
        const current = Array.isArray(data.production_center_ids) ? [...data.production_center_ids] : [];
        const exists = current.includes(centerId);

        if (checked && !exists) {
            current.push(centerId);
            setData('production_center_ids', current);
            return;
        }

        if (!checked && exists) {
            setData(
                'production_center_ids',
                current.filter((id) => id !== centerId),
            );
        }
    };

    const productionCenterError = useMemo(() => {
        if (errors.production_center_ids) {
            return errors.production_center_ids;
        }

        const nestedError = Object.entries(errors).find(([key]) => key.startsWith('production_center_ids.'));

        return nestedError ? nestedError[1] : undefined;
    }, [errors]);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(userRoutes.store().url);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Usuario" />
            <ModuleLayout title="Crear Usuario" description="Completa el formulario para crear un nuevo usuario." navItems={navItems}>
                <form onSubmit={submit} className="space-y-6">
                    {isSuperAdmin && (
                        <div className="grid gap-2">
                            <Label htmlFor="company_id">Compañía</Label>
                            <Select
                                value={data.company_id}
                                onValueChange={(value) => setData('company_id', value)}
                                disabled={isActorAdmin && !isSuperAdmin}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona una compañía" />
                                </SelectTrigger>
                                <SelectContent>
                                    {companiesOptions.map((company) => (
                                        <SelectItem key={String(company.id)} value={String(company.id)}>
                                            {company.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.company_id} />
                        </div>
                    )}
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoFocus
                            placeholder="Ingresa el nombre"
                            autoComplete="nope"
                        />
                        <InputError message={errors.name} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="last_name">Apellido</Label>
                        <Input
                            id="last_name"
                            value={data.last_name}
                            onChange={(e) => setData('last_name', e.target.value)}
                            required
                            placeholder="Ingresa el apellido"
                            autoComplete="new-password"
                        />
                        <InputError message={errors.last_name} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            placeholder="email@example.com"
                            autoComplete="off"
                        />
                        <InputError message={errors.email} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            placeholder="Ingresa una contraseña segura"
                            autoComplete="off"
                        />
                        <InputError message={errors.password} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirmar Contraseña</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                            placeholder="Confirma la contraseña"
                            autoComplete="off"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="role_id">Cargo</Label>
                        <Select value={data.role_id} onValueChange={(value) => setData('role_id', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un cargo" />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map((role) => (
                                    <SelectItem key={String(role.id)} value={String(role.id)}>
                                        {role.label ?? role.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.role_id} />
                    </div>
                    {(requiresProductionCenters || (isActorAdmin && !isSuperAdmin)) && (
                        <div className="grid gap-2">
                            <Label>Centros de producción</Label>
                            {!data.company_id && (
                                <p className="text-sm text-muted-foreground">Selecciona una compañía para ver los centros disponibles.</p>
                            )}
                            {data.company_id && availableProductionCenters.length === 0 && (
                                <p className="text-sm text-muted-foreground">No hay centros de producción disponibles para esta compañía.</p>
                            )}
                            {data.company_id && availableProductionCenters.length > 0 && (
                                <div className="space-y-2 rounded-md border p-3">
                                    {availableProductionCenters.map((center) => {
                                        const centerId = String(center.id);
                                        const checked = data.production_center_ids.includes(centerId);

                                        return (
                                            <label key={centerId} className="flex items-center gap-2 text-sm">
                                                <Checkbox
                                                    checked={checked}
                                                    onCheckedChange={(value) => toggleProductionCenter(centerId, value === true)}
                                                    disabled={processing}
                                                />
                                                <span>{center.name}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                            <InputError message={productionCenterError} />
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="phone_area_code">Código de Área</Label>
                            <Input
                                id="phone_area_code"
                                value={data.phone_area_code}
                                onChange={(e) => setData('phone_area_code', e.target.value)}
                                placeholder="+56"
                                autoComplete="off"
                                pattern="\+\d{1,3}"
                                title="El código de área debe comenzar con + seguido de 1 a 3 dígitos."
                            />
                            <InputError message={errors.phone_area_code} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Teléfono</Label>
                            <Input
                                id="phone"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                placeholder="999999999"
                                autoComplete="off"
                                pattern="\d{8,9}"
                                title="El número de teléfono debe tener entre 8 y 9 dígitos."
                            />
                            <InputError message={errors.phone} />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button disabled={processing}>Crear Usuario</Button>
                    </div>
                </form>
            </ModuleLayout>
        </AppLayout>
    );
}
