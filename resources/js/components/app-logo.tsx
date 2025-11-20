import { CSSProperties } from 'react';

import { cn } from '../lib/utils';
import AppLogoIcon from './app-logo-icon';

type AppLogoSize = 'sm' | 'md' | 'lg';

const SIZE_MAP: Record<AppLogoSize, number> = {
    sm: 32,
    md: 40,
    lg: 64,
};

type AppLogoProps = {
    size?: AppLogoSize | number;
    className?: string;
};

export default function AppLogo({ size = 'md', className }: AppLogoProps) {
    const resolvedSize = typeof size === 'number' ? size : (SIZE_MAP[size] ?? SIZE_MAP.md);

    const wrapperStyle: CSSProperties = {
        width: '100%',
        height: '100%',
        maxWidth: resolvedSize,
        maxHeight: resolvedSize,
    };

    return (
        <>
            <div
                className={cn(
                    'flex aspect-square h-full w-full items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground',
                    className,
                )}
                style={wrapperStyle}
            >
                <AppLogoIcon size={resolvedSize} fitContainer className="fill-current text-white dark:text-black" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 leading-tight font-extrabold">Solid Base Template</span>
            </div>
        </>
    );
}
