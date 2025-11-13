import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@utils/helpers';

// ============================================
// INPUT - Componente base abstracto
// ============================================

export type InputVariant = 'default' | 'error' | 'success';
export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: InputVariant;
  inputSize?: InputSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<InputVariant, string> = {
  default: 'border-earth-300 focus:ring-forest-500 focus:border-forest-500',
  error: 'border-red-500 focus:ring-red-500 focus:border-red-500',
  success: 'border-forest-500 focus:ring-forest-500 focus:border-forest-500',
};

const sizeStyles: Record<InputSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-5 py-3 text-lg',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'default',
      inputSize = 'md',
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      ...props
    },
    ref
  ) => {
    const hasIcons = leftIcon || rightIcon;

    if (hasIcons) {
      return (
        <div className={cn('relative', fullWidth && 'w-full')}>
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-500">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'input-base',
              variantStyles[variant],
              sizeStyles[inputSize],
              leftIcon ? 'pl-10' : '',
              rightIcon ? 'pr-10' : '',
              fullWidth && 'w-full',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-500">
              {rightIcon}
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        ref={ref}
        className={cn(
          'input-base',
          variantStyles[variant],
          sizeStyles[inputSize],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
