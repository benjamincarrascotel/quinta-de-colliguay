import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { useAuth } from '@/hooks/useAuth';
import { send } from '@/routes/verification';
import { type BreadcrumbItem, type NavItem, type User } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head, Link } from '@inertiajs/react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import ModuleLayout from '@/layouts/module-layout';
import { appearance } from '@/routes';
import { edit as editPassword } from '@/routes/password';
import { edit } from '@/routes/profile';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Configuraciones',
        href: '#',
    },
    {
        title: 'Perfil',
        href: edit().url,
    },
];

const sidebarNavItems: NavItem[] = [
    {
        title: 'Perfil',
        href: edit(),
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

const roleCardStyles = {
    base: 'flex w-full max-w-sm items-center gap-3 rounded-xl border px-4 py-3 shadow-sm transition-colors sm:max-w-none',
    superadmin: 'border-green-200 bg-green-50 text-green-900 dark:border-green-800/80 dark:bg-green-950/40 dark:text-green-100',
    admin: 'border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-700/80 dark:bg-yellow-950/40 dark:text-yellow-100',
    default: 'border-neutral-200 bg-neutral-50 text-neutral-900 dark:border-neutral-700/80 dark:bg-neutral-900/40 dark:text-neutral-100',
} as const;

const roleAccentStyles = {
    superadmin: 'border-green-300/70 bg-green-200/70 text-green-900 dark:border-green-700 dark:bg-green-900/70 dark:text-green-100',
    admin: 'border-yellow-300/70 bg-yellow-200/70 text-yellow-900 dark:border-yellow-600 dark:bg-yellow-900/70 dark:text-yellow-100',
    default: 'border-neutral-300/70 bg-neutral-200/70 text-neutral-800 dark:border-neutral-600 dark:bg-neutral-800/70 dark:text-neutral-100',
} as const;

type ExtendedUser = User & {
    email_verified_at?: string | null;
    phone_area_code?: string | null;
    phone?: string | null;
    role_for_display?: string | null;
};

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { user, isSuperAdmin, isAdmin } = useAuth();
    const extendedUser = user as ExtendedUser | null;

    const roleLabel = extendedUser?.role_for_display ?? 'Sin cargo asignado';
    const roleTone: keyof typeof roleAccentStyles = isSuperAdmin ? 'superadmin' : isAdmin ? 'admin' : 'default';
    const roleInitials =
        roleLabel
            .split(/\s+/)
            .filter(Boolean)
            .map((part) => part[0] ?? '')
            .join('')
            .slice(0, 2)
            .toUpperCase() || 'NA';
    const roleCardClass = `${roleCardStyles.base} ${roleCardStyles[roleTone]}`;
    const roleAccentClass = `flex h-12 w-12 items-center justify-center rounded-lg border text-lg font-semibold uppercase ${roleAccentStyles[roleTone]}`;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Perfil" />

            <ModuleLayout title="Perfil" description="Configuración de tu perfil." navItems={sidebarNavItems}>
                <div className="space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <HeadingSmall title="Información del perfil" description="Visualiza y actualiza tus datos actuales." />

                        {user && (
                            <div className="flex flex-col gap-2">
                                <div className={roleCardClass}>
                                    <div className={roleAccentClass}>{roleInitials}</div>
                                    <div className="space-y-1">
                                        <span className="text-xs font-medium tracking-wide text-neutral-600 uppercase dark:text-neutral-400">
                                            Cargo actual
                                        </span>
                                        <p className="text-lg leading-6 font-semibold">{roleLabel}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nombre</Label>

                                    <Input
                                        id="name"
                                        className="mt-1 block w-full"
                                        defaultValue={extendedUser?.name ?? ''}
                                        name="name"
                                        required
                                        autoComplete="name"
                                        placeholder="Nombre completo"
                                    />

                                    <InputError className="mt-2" message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="last_name">Apellido</Label>

                                    <Input
                                        id="last_name"
                                        className="mt-1 block w-full"
                                        defaultValue={extendedUser?.last_name ?? ''}
                                        name="last_name"
                                        required
                                        autoComplete="family-name"
                                        placeholder="Apellido completo"
                                    />

                                    <InputError className="mt-2" message={errors.last_name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Correo electrónico</Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        defaultValue={extendedUser?.email ?? ''}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        placeholder="Correo electrónico"
                                    />

                                    <InputError className="mt-2" message={errors.email} />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-[160px_minmax(0,1fr)]">
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone_area_code">Código de área</Label>

                                        <Input
                                            id="phone_area_code"
                                            className="mt-1 block w-full"
                                            defaultValue={extendedUser?.phone_area_code ?? ''}
                                            name="phone_area_code"
                                            autoComplete="tel-country-code"
                                            inputMode="tel"
                                            pattern="\+\d{1,3}"
                                            title="Debe comenzar con + y contener entre 1 y 3 dígitos"
                                            placeholder="Ej. +56"
                                        />

                                        <InputError className="mt-2" message={errors.phone_area_code} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">Teléfono</Label>

                                        <Input
                                            id="phone"
                                            className="mt-1 block w-full"
                                            defaultValue={extendedUser?.phone ?? ''}
                                            name="phone"
                                            autoComplete="tel-national"
                                            inputMode="tel"
                                            pattern="\d{8,9}"
                                            title="Debe contener entre 8 y 9 dígitos"
                                            placeholder="Ej. 987654321"
                                        />

                                        <InputError className="mt-2" message={errors.phone} />
                                    </div>
                                </div>

                                {mustVerifyEmail && extendedUser?.email_verified_at === null && (
                                    <div>
                                        <p className="-mt-4 text-sm text-muted-foreground">
                                            Tu dirección de correo electrónico no está verificada.{' '}
                                            <Link
                                                href={send()}
                                                as="button"
                                                className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                            >
                                                Haz clic aquí para reenviar el correo de verificación.
                                            </Link>
                                        </p>

                                        {status === 'verification-link-sent' && (
                                            <div className="mt-2 text-sm font-medium text-green-600">
                                                Se ha enviado un nuevo enlace de verificación a tu dirección de correo electrónico.
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center gap-4">
                                    <Button disabled={processing}>Guardar</Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">Guardado</p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </ModuleLayout>
        </AppLayout>
    );
}
