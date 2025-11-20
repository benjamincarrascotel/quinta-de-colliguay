import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/layouts/app-layout';
import ModuleLayout from '@/layouts/module-layout';
import * as userRoutes from '@/routes/users';
import { BreadcrumbItem, Company, NavItem, PageProps, User } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Usuarios',
        href: userRoutes.index().url,
    },
    {
        title: 'Cambiar Contraseña',
        href: userRoutes.changePasswordForm().url,
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

export default function ChangePassword({ companies, users }: PageProps<{ companies: Company[]; users: User[] }>) {
    const { isSuperAdmin } = useAuth();

    const [selectedCompany, setSelectedCompany] = useState('');

    const { data, setData, put, processing, errors, reset } = useForm({
        user_id: '',
        password: '',
        password_confirmation: '',
    });

    const filteredUsers = useMemo(() => {
        if (isSuperAdmin) {
            if (selectedCompany === 'all' || !selectedCompany) {
                return users;
            }
            return users.filter((user) => user.company_id === Number(selectedCompany));
        }
        return users;
    }, [users, selectedCompany, isSuperAdmin]);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(userRoutes.changePasswordUpdate({ user: data.user_id }).url, {
            onSuccess: () => reset(),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cambiar Contraseña de Usuario" />
            <ModuleLayout title="Cambiar Contraseña" description="Selecciona un usuario y cambia su contraseña." navItems={navItems}>
                <form onSubmit={submit} className="space-y-6">
                    {isSuperAdmin && (
                        <div className="grid gap-2">
                            <Label htmlFor="company_id">Compañía</Label>
                            <Select onValueChange={setSelectedCompany} defaultValue="all">
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona una compañía" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas</SelectItem>
                                    {companies.map((company) => (
                                        <SelectItem key={String(company.id)} value={String(company.id)}>
                                            {company.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="user_id">Usuario</Label>
                        <Select value={data.user_id} onValueChange={(value) => setData('user_id', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un usuario" />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredUsers.map((user) => (
                                    <SelectItem key={String(user.id)} value={String(user.id)}>
                                        {user.name} {user.last_name} - {user.email}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.user_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Nueva Contraseña</Label>
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            placeholder="Ingresa la nueva contraseña"
                            autoComplete="new-password"
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
                            placeholder="Confirma la nueva contraseña"
                            autoComplete="new-password"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button disabled={processing}>Cambiar Contraseña</Button>
                    </div>
                </form>
            </ModuleLayout>
        </AppLayout>
    );
}
