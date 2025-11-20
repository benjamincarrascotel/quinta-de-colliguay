import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem, type NavItem } from '@/types';

import AppLayout from '@/layouts/app-layout';
import ModuleLayout from '@/layouts/module-layout';
import { appearance } from '@/routes';
import { edit as editPassword } from '@/routes/password';
import { edit as editProfile } from '@/routes/profile';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Configuraciones',
        href: '#',
    },
    {
        title: 'Apariencia',
        href: appearance().url,
    },
];

const sidebarNavItems: NavItem[] = [
    {
        title: 'Perfil',
        href: editProfile(),
        icon: null,
    },
    {
        title: 'Contraseña',
        href: editPassword(),
        icon: null,
    },
    {
        title: 'Apariencia',
        href: appearance(),
        icon: null,
    },
];

export default function Appearance() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configuración de apariencia" />

            <ModuleLayout title="Apariencia" description="Configuración de apariencia del sistema." navItems={sidebarNavItems}>
                <div className="space-y-6">
                    <HeadingSmall title="Configuración de apariencia" description="Actualiza la configuración de apariencia de tu cuenta." />
                    <AppearanceTabs />
                </div>
            </ModuleLayout>
        </AppLayout>
    );
}
