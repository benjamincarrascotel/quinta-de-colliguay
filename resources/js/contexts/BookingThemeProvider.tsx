/**
 * BOOKING THEME PROVIDER
 *
 * Aísla el sistema de booking del tema global (dark/light mode).
 * Fuerza modo light en todo el árbol de componentes de booking.
 *
 * Funcionalidad:
 * - Remueve clase 'dark' del <html> al montar
 * - Restaura tema original al desmontar
 * - Fuerza variables CSS light con inline styles
 * - Aplica color-scheme: light para formularios nativos
 */

import { ReactNode, useEffect, useState } from 'react';

interface BookingThemeProviderProps {
  children: ReactNode;
}

export function BookingThemeProvider({ children }: BookingThemeProviderProps) {
  const [originalTheme, setOriginalTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Guardar tema original
    const isDark = document.documentElement.classList.contains('dark');
    setOriginalTheme(isDark ? 'dark' : 'light');

    // Forzar light mode
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';

    // Restaurar tema original al desmontar
    return () => {
      if (originalTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
      }
    };
  }, [originalTheme]);

  // Inline styles que fuerzan variables CSS light
  const lightThemeStyles: React.CSSProperties = {
    // Variables CSS Tailwind (OKLCH format)
    '--background': 'oklch(1 0 0)',
    '--foreground': 'oklch(0.145 0 0)',
    '--card': 'oklch(1 0 0)',
    '--card-foreground': 'oklch(0.145 0 0)',
    '--popover': 'oklch(1 0 0)',
    '--popover-foreground': 'oklch(0.145 0 0)',
    '--primary': 'oklch(0.527 0.146 161.35)',
    '--primary-foreground': 'oklch(0.985 0 0)',
    '--secondary': 'oklch(0.961 0 0)',
    '--secondary-foreground': 'oklch(0.145 0 0)',
    '--muted': 'oklch(0.961 0 0)',
    '--muted-foreground': 'oklch(0.455 0.012 256.85)',
    '--accent': 'oklch(0.961 0 0)',
    '--accent-foreground': 'oklch(0.145 0 0)',
    '--destructive': 'oklch(0.577 0.245 27.33)',
    '--destructive-foreground': 'oklch(0.985 0 0)',
    '--border': 'oklch(0.922 0 0)',
    '--input': 'oklch(0.922 0 0)',
    '--ring': 'oklch(0.87 0 0)',
    '--chart-1': 'oklch(0.633 0.179 21.13)',
    '--chart-2': 'oklch(0.706 0.151 164.1)',
    '--chart-3': 'oklch(0.532 0.24 196.67)',
    '--chart-4': 'oklch(0.808 0.149 99.01)',
    '--chart-5': 'oklch(0.661 0.196 329.68)',
    '--radius': '0.5rem',

    // Color scheme para elementos nativos del navegador
    colorScheme: 'light',
  } as React.CSSProperties;

  return (
    <div
      className="booking-theme-light"
      style={lightThemeStyles}
      data-theme="light"
    >
      {children}
    </div>
  );
}
