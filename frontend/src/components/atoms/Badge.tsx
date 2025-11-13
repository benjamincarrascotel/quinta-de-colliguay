import { HTMLAttributes } from 'react';
import { cn } from '@utils/helpers';
import type { ReservationStatus } from '@/types/index';

// ============================================
// BADGE - Componente base abstracto
// ============================================

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  rounded?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-earth-100 text-earth-700 border-earth-200',
  primary: 'bg-forest-100 text-forest-700 border-forest-200',
  success: 'bg-green-100 text-green-700 border-green-200',
  warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  danger: 'bg-red-100 text-red-700 border-red-200',
  info: 'bg-water-100 text-water-700 border-water-200',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  rounded = true,
  className,
  ...props
}: BadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium border',
        variantStyles[variant],
        sizeStyles[size],
        rounded ? 'rounded-full' : 'rounded-md',
        className
      )}
      {...props}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
};

// Variante específica para estados de reserva
export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: ReservationStatus;
}

const statusToVariant: Record<ReservationStatus, BadgeVariant> = {
  requested: 'info',
  confirmed: 'success',
  cancelled: 'default',
};

const statusLabels: Record<ReservationStatus, string> = {
  requested: 'Solicitado',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
};

export const StatusBadge = ({ status, ...props }: StatusBadgeProps) => {
  return (
    <Badge variant={statusToVariant[status]} dot {...props}>
      {statusLabels[status]}
    </Badge>
  );
};
