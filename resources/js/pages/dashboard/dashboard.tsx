import { DashboardCard } from '@/components/dashboard/shared/base/DashboardCard';
import { DashboardSection } from '@/components/dashboard/shared/base/DashboardSection';
import { KpiCard } from '@/components/dashboard/shared/base/KpiCard';
import AppLayout from '@/layouts/app-layout';
import dashboardRoutes from '@/routes/dashboard';
import { Head } from '@inertiajs/react';
import { Building2, Factory, LayoutGrid, Users } from 'lucide-react';
import { useMemo } from 'react';

export default function Dashboard() {
    // Dynamic breadcrumbs
    const breadcrumbs = useMemo(
        () => [
            {
                title: 'Dashboard',
                href: dashboardRoutes.index().url,
            },
        ],
        [],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Hero */}
                <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 shadow-sm ring-1 ring-border">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <LayoutGrid className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Panel base</p>
                                <h1 className="text-2xl leading-tight font-semibold">Gestiona compañías, centros y usuarios</h1>
                                <p className="text-sm text-muted-foreground">
                                    Usa este panel como punto de partida para tus flujos de administración.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick stats */}
                <DashboardSection title="Vista rápida" description="Tarjetas simétricas para mantener la estructura del panel." spacing="sm">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <KpiCard title="Compañías" value="—" icon={Building2} variant="primary" description="Añade tu primera compañía" />
                        <KpiCard title="Centros" value="—" icon={Factory} variant="info" description="Crea centros para organizar tus operaciones" />
                        <KpiCard title="Usuarios" value="—" icon={Users} variant="success" description="Invita a tu equipo" />
                        <KpiCard title="Roles" value="—" icon={LayoutGrid} variant="warning" description="Define permisos base" />
                    </div>
                </DashboardSection>

                {/* Next steps */}
                <DashboardSection
                    borderTop
                    spacing="lg"
                    title="Pasos sugeridos"
                    description="Dos bloques equilibrados para guiar el uso del template."
                >
                    <div className="grid gap-4 lg:grid-cols-2">
                        <DashboardCard
                            title="Configura tu organización"
                            description="Crea la jerarquía mínima para empezar."
                            padding="md"
                            variant="muted"
                        >
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>• Registra las compañías con las que trabajarás.</li>
                                <li>• Añade centros de producción por compañía.</li>
                                <li>• Define roles y permisos según tu equipo.</li>
                            </ul>
                        </DashboardCard>

                        <DashboardCard
                            title="Prepara a tu equipo"
                            description="Un bloque espejo para mantener simetría visual."
                            padding="md"
                            variant="gradient"
                        >
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>• Crea usuarios y asigna sus roles.</li>
                                <li>• Vincula usuarios a los centros que gestionan.</li>
                                <li>• Ajusta la apariencia y preferencias iniciales.</li>
                            </ul>
                        </DashboardCard>
                    </div>
                </DashboardSection>
            </div>
        </AppLayout>
    );
}
