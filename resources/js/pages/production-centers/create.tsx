import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect } from 'react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/layouts/app-layout';
import ModuleLayout from '@/layouts/module-layout';
import * as productionCenterRoutes from '@/routes/production_centers';
import { BreadcrumbItem, Company, NavItem, PageProps } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';

const productionCentersIndexRoute = productionCenterRoutes.index({
    query: {
        with_form_data: true,
    },
});

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Centros de Producción',
        href: productionCentersIndexRoute.url,
    },
    {
        title: 'Crear Nuevo',
        href: '#',
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

export default function ProductionCentersCreate() {
    const { props } = usePage<PageProps<{ companies: Company[] }>>();
    const { companies } = props;

    const { data, setData, post, errors, processing } = useForm({
        name: '',
        company_id: '',
    });

    const { user: actor, isAdmin: isActorAdmin, isSuperAdmin } = useAuth();
    const actorCompanyId = actor?.company_id ?? null;

    useEffect(() => {
        if (isActorAdmin && !isSuperAdmin && actorCompanyId) {
            setData('company_id', String(actorCompanyId));
        }
    }, [isActorAdmin, isSuperAdmin, actorCompanyId, setData]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(productionCenterRoutes.store().url);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Centro de Producción" />
            <ModuleLayout title="Crear Centro de Producción" description="Añade un nuevo centro de producción al sistema." navItems={navItems}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {isSuperAdmin && (
                        <div className="grid gap-2">
                            <Label htmlFor="company_id">Compañía</Label>
                            <Select value={data.company_id} onValueChange={(value) => setData('company_id', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona una compañía" />
                                </SelectTrigger>
                                <SelectContent>
                                    {companies.map((company) => (
                                        <SelectItem key={company.id} value={String(company.id)}>
                                            {company.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.company_id} />
                        </div>
                    )}
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nombre del Centro</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required autoFocus />
                        <InputError message={errors.name} />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button disabled={processing}>Guardar Centro</Button>
                    </div>
                </form>
            </ModuleLayout>
        </AppLayout>
    );
}
