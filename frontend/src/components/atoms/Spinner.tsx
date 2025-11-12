import { HTMLAttributes } from 'react';
import { cn } from '@utils/helpers';

// ============================================
// SPINNER - Componente base abstracto
// ============================================

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'primary' | 'secondary' | 'white';

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  label?: string;
  center?: boolean;
}

const sizeStyles: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-3',
  xl: 'w-16 h-16 border-4',
};

const variantStyles: Record<SpinnerVariant, string> = {
  primary: 'border-forest-200 border-t-forest-600',
  secondary: 'border-water-200 border-t-water-600',
  white: 'border-white/30 border-t-white',
};

export const Spinner = ({
  size = 'md',
  variant = 'primary',
  label,
  center = false,
  className,
  ...props
}: SpinnerProps) => {
  const spinner = (
    <div
      role="status"
      aria-label={label || 'Cargando...'}
      className={cn('inline-block', center && 'mx-auto', className)}
      {...props}
    >
      <div
        className={cn(
          'animate-spin rounded-full',
          sizeStyles[size],
          variantStyles[variant]
        )}
      />
      {label && <span className="sr-only">{label}</span>}
    </div>
  );

  if (center) {
    return <div className="flex justify-center items-center w-full">{spinner}</div>;
  }

  return spinner;
};

// Variante de pantalla completa para loading states
export interface FullPageSpinnerProps extends Omit<SpinnerProps, 'center'> {
  message?: string;
}

export const FullPageSpinner = ({ message, ...props }: FullPageSpinnerProps) => {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <Spinner size="xl" {...props} />
        {message && <p className="mt-4 text-earth-700 font-medium">{message}</p>}
      </div>
    </div>
  );
};
