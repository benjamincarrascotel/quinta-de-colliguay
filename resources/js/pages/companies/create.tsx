import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import ModuleLayout from '@/layouts/module-layout';
import * as companyRoutes from '@/routes/companies';
import { BreadcrumbItem, NavItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';

const companiesIndexRoute = companyRoutes.index();

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Compañías',
        href: companiesIndexRoute.url,
    },
    {
        title: 'Crear Nueva',
        href: '#',
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

export default function CompaniesCreate() {
    const { data, setData, post, errors, processing } = useForm({
        name: '',
        is_active: true,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(companyRoutes.store().url);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Compañía" />
            <ModuleLayout title="Crear Compañía" description="Añade una nueva compañía al sistema." navItems={navItems}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nombre de la Compañía</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required autoFocus />
                        <InputError message={errors.name} />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox id="is_active" checked={data.is_active} onCheckedChange={(checked) => setData('is_active', checked === true)} />
                        <Label htmlFor="is_active" className="cursor-pointer text-sm font-normal">
                            Compañía activa
                        </Label>
                        <InputError message={errors.is_active} />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button disabled={processing}>Guardar Compañía</Button>
                    </div>
                </form>
            </ModuleLayout>
        </AppLayout>
    );
}
