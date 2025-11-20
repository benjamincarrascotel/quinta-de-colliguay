import { useEffect, useMemo, useState } from 'react';

import { useDataTable } from '@/components/data-table-context';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageDialog } from '@/components/ui/message-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import * as userRoutes from '@/routes/users';
import { Company, PageProps, ProductionCenter, Role, User } from '@/types';
import { usePage } from '@inertiajs/react';

type UserFormData = {
    name: string;
    last_name: string;
    email: string;
    phone: string;
    phone_area_code: string;
    role_id: string;
    company_id: string;
    production_center_ids: string[];
};

type ProductionCentersByCompany = Record<number, ProductionCenter[]>;

interface UserViewDialogProps {
    user: User;
}

export function UserViewDialog({ user }: UserViewDialogProps) {
    const [open, setOpen] = useState(false);
    const formId = useMemo(() => `user-${user.id}-edit-form`, [user.id]);

    const resolvedRoleId = user.role_id ?? (typeof user.role !== 'string' ? (user.role?.id ?? null) : null);
    const resolvedCompanyId = user.company_id ?? null;
    const resolvedProductionCenterIds = useMemo(() => {
        const centers = user.production_centers;
        if (Array.isArray(centers)) {
            return centers.map((center) => String(center.id));
        }
        return [];
    }, [user.production_centers]);

    const { roles, companies, productionCenters } = usePage<
        PageProps<{
            roles: Role[];
            companies: Company[];
            productionCenters: ProductionCentersByCompany;
        }>
    >().props;
    const { user: actor, isAdmin: isActorAdmin } = useAuth();

    const isSuperAdmin = user.is_superadmin;
    const isAdmin = user.is_admin;

    const isAdminRestricted = isActorAdmin && isAdmin;
    const isReadOnly = isSuperAdmin || isAdminRestricted;
    const actorCompanyId = actor?.company_id ?? null;

    const rolesById = useMemo(() => {
        const lookup: Record<string, Role> = {};
        roles.forEach((role) => {
            lookup[String(role.id)] = role;
        });
        return lookup;
    }, [roles]);

    const companiesOptions = useMemo(() => {
        if (isActorAdmin && actorCompanyId) {
            return companies.filter((company) => company.id === actorCompanyId);
        }

        return companies;
    }, [actorCompanyId, companies, isActorAdmin]);

    const initialData = useMemo<UserFormData>(
        () => ({
            name: user.name ?? '',
            last_name: user.last_name ?? '',
            email: user.email ?? '',
            phone: user.phone ?? '',
            phone_area_code: user.phone_area_code ?? '',
            role_id: resolvedRoleId ? String(resolvedRoleId) : '',
            company_id: resolvedCompanyId ? String(resolvedCompanyId) : '',
            production_center_ids: [...resolvedProductionCenterIds],
        }),
        [resolvedCompanyId, resolvedProductionCenterIds, resolvedRoleId, user.email, user.last_name, user.name, user.phone, user.phone_area_code],
    );

    const identity = useMemo(() => `${user.id}|${user.updated_at ?? ''}`, [user.id, user.updated_at]);

    const { useFormWithFilters } = useDataTable();

    const { data, setData, reset, errors, processing, patch, recentlySuccessful, isDirty } = useFormWithFilters(initialData, {
        identity,
    });

    const selectedRole = rolesById[data.role_id] ?? null;
    const selectedRoleName = (selectedRole?.name ?? '').toLowerCase();

    const requiresCompany = ['admin', 'normal'].includes(selectedRoleName);
    const requiresProductionCenters = ['normal'].includes(selectedRoleName);

    const userHadCompany = useMemo(() => {
        return resolvedCompanyId !== null;
    }, [resolvedCompanyId]);

    const availableProductionCenters = useMemo(() => {
        if (!data.company_id) {
            return [] as ProductionCenter[];
        }

        return (productionCenters as ProductionCentersByCompany)[Number(data.company_id)] ?? [];
    }, [data.company_id, productionCenters]);

    useEffect(() => {
        if (!open) {
            reset();
        }
    }, [open, reset]);

    useEffect(() => {
        if (!isReadOnly && isActorAdmin && actorCompanyId && data.company_id !== String(actorCompanyId)) {
            setData('company_id', String(actorCompanyId));
        }
    }, [actorCompanyId, data.company_id, isActorAdmin, setData, isReadOnly]);

    useEffect(() => {
        if (!requiresCompany && data.company_id) {
            setData('company_id', '');
        }
    }, [data.company_id, requiresCompany, setData]);

    useEffect(() => {
        if (!requiresProductionCenters && data.production_center_ids.length > 0) {
            setData('production_center_ids', []);
        }
    }, [data.production_center_ids.length, requiresProductionCenters, setData]);

    useEffect(() => {
        if (!data.company_id && data.production_center_ids.length > 0) {
            setData('production_center_ids', []);
            return;
        }

        if (!data.company_id) {
            return;
        }

        const allowedIds = new Set(availableProductionCenters.map((center) => String(center.id)));
        const filtered = data.production_center_ids.filter((id: string) => allowedIds.has(id));

        if (filtered.length !== data.production_center_ids.length) {
            setData('production_center_ids', filtered);
        }
    }, [availableProductionCenters, data.company_id, data.production_center_ids, setData]);

    const toggleProductionCenter = (centerId: string, checked: boolean) => {
        if (isReadOnly) {
            return;
        }

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

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isSuperAdmin || isReadOnly) {
            return;
        }

        patch(
            userRoutes.update({
                user: String(user.id),
            }).url,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setOpen(false);
                },
            },
        );
    };

    const dialogActions = isReadOnly
        ? [
              {
                  label: 'Cerrar',
                  variant: 'secondary' as const,
                  closesDialog: true,
                  onClick: () => reset(),
              },
          ]
        : [
              {
                  label: 'Guardar',
                  variant: 'default' as const,
                  type: 'submit' as const,
                  form: formId,
                  disabled: processing || !isDirty,
              },
              {
                  label: 'Cancelar',
                  variant: 'secondary' as const,
                  closesDialog: true,
                  onClick: () => reset(),
              },
          ];

    const readOnlyMessage = isSuperAdmin
        ? 'Los superadministradores solo pueden editar su información desde su propio perfil.'
        : isAdminRestricted
          ? 'Los administradores no pueden editar administradores desde esta vista.'
          : null;

    return (
        <MessageDialog
            open={open}
            onOpenChange={setOpen}
            trigger={
                <Button size="sm" variant="default">
                    Ver
                </Button>
            }
            title="Detalles del usuario"
            description={
                <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor={`${formId}-name`}>Nombre</Label>
                        <Input
                            id={`${formId}-name`}
                            value={data.name}
                            onChange={(event) => setData('name', event.target.value)}
                            required
                            placeholder="Nombre"
                            disabled={isReadOnly}
                        />
                        <InputError message={errors.name} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor={`${formId}-last-name`}>Apellido</Label>
                        <Input
                            id={`${formId}-last-name`}
                            value={data.last_name}
                            onChange={(event) => setData('last_name', event.target.value)}
                            required
                            placeholder="Apellido"
                            disabled={isReadOnly}
                        />
                        <InputError message={errors.last_name} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor={`${formId}-email`}>Correo electrónico</Label>
                        <Input
                            id={`${formId}-email`}
                            type="email"
                            value={data.email}
                            onChange={(event) => setData('email', event.target.value)}
                            required
                            placeholder="correo@ejemplo.com"
                            disabled={isReadOnly}
                        />
                        <InputError message={errors.email} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-[160px_minmax(0,1fr)]">
                        <div className="grid gap-2">
                            <Label htmlFor={`${formId}-phone-area-code`}>Código de área</Label>
                            <Input
                                id={`${formId}-phone-area-code`}
                                value={data.phone_area_code}
                                onChange={(event) => setData('phone_area_code', event.target.value)}
                                placeholder="+56"
                                pattern="\\+\\d{1,3}"
                                title="Debe comenzar con + y contener entre 1 y 3 dígitos"
                                disabled={isReadOnly}
                            />
                            <InputError message={errors.phone_area_code} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor={`${formId}-phone`}>Teléfono</Label>
                            <Input
                                id={`${formId}-phone`}
                                value={data.phone}
                                onChange={(event) => setData('phone', event.target.value)}
                                placeholder="987654321"
                                pattern="\\d{8,9}"
                                title="Debe contener entre 8 y 9 dígitos"
                                disabled={isReadOnly}
                            />
                            <InputError message={errors.phone} />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor={`${formId}-role`}>Cargo</Label>
                        <Select value={data.role_id} onValueChange={(value) => setData('role_id', value)} disabled={isReadOnly}>
                            <SelectTrigger id={`${formId}-role`}>
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
                    {requiresCompany && (
                        <div className="grid gap-2">
                            <Label htmlFor={`${formId}-company`}>Compañía</Label>
                            <Select
                                value={data.company_id}
                                onValueChange={(value) => setData('company_id', value)}
                                disabled={isReadOnly || userHadCompany}
                            >
                                <SelectTrigger id={`${formId}-company`}>
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
                    {requiresProductionCenters && (
                        <div className="grid gap-2">
                            <Label>Centros de producción</Label>
                            <div className="grid gap-2 rounded-md border p-3">
                                {availableProductionCenters.length === 0 && (
                                    <p className="text-sm text-muted-foreground">
                                        No hay centros de producción disponibles para la compañía seleccionada.
                                    </p>
                                )}
                                {availableProductionCenters.map((center) => {
                                    const value = String(center.id);
                                    const checked = data.production_center_ids.includes(value);

                                    return (
                                        <label key={value} className="flex items-center gap-2 text-sm">
                                            <Checkbox
                                                checked={checked}
                                                onCheckedChange={(checkedValue) => toggleProductionCenter(value, Boolean(checkedValue))}
                                                disabled={isReadOnly}
                                            />
                                            <span>{center.name}</span>
                                        </label>
                                    );
                                })}
                            </div>
                            <InputError message={productionCenterError} />
                        </div>
                    )}
                    {readOnlyMessage && <p className="text-sm text-muted-foreground">{readOnlyMessage}</p>}
                    {recentlySuccessful && !isReadOnly && <p className="text-sm text-green-600">Cambios guardados</p>}
                </form>
            }
            actions={dialogActions}
        />
    );
}
