import { LucideIcon } from 'lucide-react';

export type NavItem = {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    icon?: LucideIcon;
    items?: NavItem[];
};

export type NavGroup = {
    label: string;
    items: NavItem[];
};

export type BreadcrumbItem = {
    title: string;
    href: string;
};
