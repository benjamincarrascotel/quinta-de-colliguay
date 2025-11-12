import { ReactNode } from 'react';
import { Input, InputProps } from '@atoms/Input';
import { Select, SelectProps } from '@atoms/Select';
import { cn } from '@utils/helpers';

// ============================================
// FORMFIELD - Compound Component Pattern
// Campo de formulario completo con label, input/select y mensaje de error
// ============================================

export interface FormFieldBaseProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
}

// FormField con Input
export interface InputFormFieldProps extends FormFieldBaseProps, InputProps {
  type?: 'input';
}

// FormField con Select
export interface SelectFormFieldProps extends FormFieldBaseProps, Omit<SelectProps, 'className'> {
  type: 'select';
}

// FormField con custom children
export interface CustomFormFieldProps extends FormFieldBaseProps {
  type: 'custom';
  children: ReactNode;
}

export type FormFieldProps = InputFormFieldProps | SelectFormFieldProps | CustomFormFieldProps;

export const FormField = (props: FormFieldProps) => {
  const { label, error, hint, required, className } = props;

  const hasError = !!error;
  const variant = hasError ? 'error' : 'default';

  // Renderiza el campo según el tipo
  const renderField = () => {
    if (props.type === 'select') {
      const { type, label, error, hint, required, className, ...selectProps } = props;
      return <Select variant={variant} fullWidth {...selectProps} />;
    }

    if (props.type === 'custom') {
      return props.children;
    }

    // Por defecto, es un Input
    const { type, label, error, hint, required, className, ...inputProps } = props as InputFormFieldProps;
    return <Input variant={variant} fullWidth {...inputProps} />;
  };

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label className="block text-sm font-medium text-earth-900">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {renderField()}

      {hint && !hasError && (
        <p className="text-xs text-earth-600">{hint}</p>
      )}

      {hasError && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};
