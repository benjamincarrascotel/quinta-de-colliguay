import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface ModuleLayoutProps {
    title: string;
    description: string;
    navItems: NavItem[];
}

export default function ModuleLayout({ title, description, children, navItems }: PropsWithChildren<ModuleLayoutProps>) {
    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;

    const buildUrl = (href: NavItem['href']) => {
        const rawUrl = typeof href === 'string' ? href : href.url;
        try {
            return new URL(rawUrl, window.location.origin);
        } catch {
            return new URL(window.location.origin + rawUrl);
        }
    };

    return (
        <div className="max-w-full px-4 py-6">
            <Heading title={title} description={description} />

            <div className="flex max-w-full flex-col lg:flex-row lg:space-x-12">
                <aside className="w-full max-w-xl flex-shrink-0 lg:w-48">
                    <nav className="flex flex-col space-y-1 space-x-0">
                        {navItems.map((item, index) => (
                            <Button
                                key={`${buildUrl(item.href).toString()}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': currentPath === buildUrl(item.href).pathname,
                                })}
                            >
                                <Link href={item.href} prefetch>
                                    {item.icon && <item.icon className="h-4 w-4" />}
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="max-w-full min-w-0 flex-1 overflow-hidden">
                    <section className="max-w-full space-y-12">{children}</section>
                </div>
            </div>
        </div>
    );
}
