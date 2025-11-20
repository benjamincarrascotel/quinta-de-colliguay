import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import * as companyRoutes from '@/routes/companies';
import dashboardRoutes from '@/routes/dashboard';
import * as productionCenterRoutes from '@/routes/production_centers';
import * as userRoutes from '@/routes/users';
import { type NavGroup, type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { Building2, Factory, LayoutGrid, Users } from 'lucide-react';
import AppLogo from './app-logo';

const footerNavItems: NavItem[] = [
    // {
    //     title: 'Repositorio',
    //     href: 'https://github.com/SolidCoreSolutionsSpa/infor_backend',
    //     icon: Folder,
    // },
    // {
    //     title: 'Documentación',
    //     href: 'https://github.com/SolidCoreSolutionsSpa/infor_backend',
    //     icon: BookOpen,
    // },
];

export function AppSidebar() {
    const { user, isSuperAdmin, isAdmin } = useAuth();

    const usersIndexRoute = userRoutes.index({
        query: {
            with_form_data: true,
        },
    });

    const productionCentersIndexRoute = productionCenterRoutes.index({
        query: {
            with_form_data: true,
        },
    });

    const navGroups: NavGroup[] = [];

    if (user) {
        const administrationItems: NavItem[] = [
            {
                title: 'Dashboard',
                href: dashboardRoutes.index().url,
                icon: LayoutGrid,
            },
        ];

        if (isSuperAdmin) {
            administrationItems.push({
                title: 'Compañías',
                href: companyRoutes.index().url,
                icon: Building2,
            });
        }

        if (isSuperAdmin || isAdmin) {
            administrationItems.push({
                title: 'Centros de Producción',
                href: productionCentersIndexRoute.url,
                icon: Factory,
            });
            administrationItems.push({
                title: 'Usuarios',
                href: usersIndexRoute.url,
                icon: Users,
            });
        }

        navGroups.push({
            label: 'Administración',
            items: administrationItems,
        });
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboardRoutes.index().url} prefetch>
                                <AppLogo size="lg" />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain groups={navGroups} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
