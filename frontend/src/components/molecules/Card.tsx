import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@utils/helpers';

// ============================================
// CARD - Componente base abstracto de tarjeta
// ============================================

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const shadowStyles = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-soft',
  lg: 'shadow-lg',
};

export const Card = ({
  children,
  padding = 'md',
  shadow = 'md',
  hoverable = false,
  className,
  ...props
}: CardProps) => {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-earth-100',
        paddingStyles[padding],
        shadowStyles[shadow],
        hoverable && 'transition-shadow duration-200 hover:shadow-lg cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// ============================================
// CARD SUB-COMPONENTS (Compound Pattern)
// ============================================

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}

export const CardHeader = ({ title, subtitle, action, children, className, ...props }: CardHeaderProps) => {
  return (
    <div className={cn('flex items-start justify-between mb-4', className)} {...props}>
      <div className="flex-1">
        {title && <h3 className="text-lg font-semibold text-earth-900">{title}</h3>}
        {subtitle && <p className="text-sm text-earth-600 mt-0.5">{subtitle}</p>}
        {children}
      </div>
      {action && <div className="ml-4">{action}</div>}
    </div>
  );
};

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {}

export const CardBody = ({ children, className, ...props }: CardBodyProps) => {
  return (
    <div className={cn('text-earth-700', className)} {...props}>
      {children}
    </div>
  );
};

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  divider?: boolean;
}

export const CardFooter = ({ children, divider = true, className, ...props }: CardFooterProps) => {
  return (
    <div
      className={cn(
        'mt-4',
        divider && 'pt-4 border-t border-earth-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Attach sub-components to Card
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
