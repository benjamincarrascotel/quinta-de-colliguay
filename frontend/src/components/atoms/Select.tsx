import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@utils/helpers';

// ============================================
// SELECT - Componente base abstracto
// ============================================

export type SelectVariant = 'default' | 'error' | 'success';
export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  variant?: SelectVariant;
  selectSize?: SelectSize;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
}

const variantStyles: Record<SelectVariant, string> = {
  default: 'border-earth-300 focus:ring-forest-500 focus:border-forest-500',
  error: 'border-red-500 focus:ring-red-500 focus:border-red-500',
  success: 'border-forest-500 focus:ring-forest-500 focus:border-forest-500',
};

const sizeStyles: Record<SelectSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-5 py-3 text-lg',
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      variant = 'default',
      selectSize = 'md',
      options,
      placeholder,
      fullWidth = false,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <select
        ref={ref}
        className={cn(
          'input-base appearance-none bg-white',
          'bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3E%3C/svg%3E")]',
          'bg-[length:1.5em_1.5em] bg-[right_0.5rem_center] bg-no-repeat pr-10',
          variantStyles[variant],
          sizeStyles[selectSize],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);

Select.displayName = 'Select';
