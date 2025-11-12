import { useState, useEffect } from 'react';
import { Button } from '@atoms/Button';
import { cn } from '@utils/helpers';
import { DEFAULT_PARAMETERS, VALIDATION_MESSAGES } from '@utils/constants';

// ============================================
// GUEST COUNTER - Contador abstracto de personas
// Puede usarse para adultos, niños, o cualquier tipo de contador
// ============================================

export interface GuestCounterProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
  className?: string;
  disabled?: boolean;
}

export const GuestCounter = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  hint,
  className,
  disabled = false,
}: GuestCounterProps) => {
  const canDecrement = value > min;
  const canIncrement = value < max;

  const handleDecrement = () => {
    if (canDecrement) {
      onChange(Math.max(min, value - step));
    }
  };

  const handleIncrement = () => {
    if (canIncrement) {
      onChange(Math.min(max, value + step));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-earth-900">{label}</label>
          {hint && <p className="text-xs text-earth-600 mt-0.5">{hint}</p>}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDecrement}
            disabled={!canDecrement || disabled}
            aria-label={`Disminuir ${label}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </Button>

          <input
            type="number"
            value={value}
            onChange={handleInputChange}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            className="w-16 text-center px-2 py-1 border border-earth-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500 disabled:bg-earth-100"
            aria-label={label}
          />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleIncrement}
            disabled={!canIncrement || disabled}
            aria-label={`Aumentar ${label}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// GUEST COMPOSITION - Composición de adultos y niños con validaciones
// ============================================

export interface GuestCompositionProps {
  adults: number;
  children: number;
  onAdultsChange: (value: number) => void;
  onChildrenChange: (value: number) => void;
  minAdults?: number;
  maxTotal?: number;
  className?: string;
  disabled?: boolean;
}

export const GuestComposition = ({
  adults,
  children,
  onAdultsChange,
  onChildrenChange,
  minAdults = DEFAULT_PARAMETERS.MIN_ADULTS,
  maxTotal = DEFAULT_PARAMETERS.MAX_TOTAL_PEOPLE,
  className,
  disabled = false,
}: GuestCompositionProps) => {
  const total = adults + children;
  const isMinAdultsMet = adults >= minAdults;
  const isMaxTotalExceeded = total > maxTotal;
  const hasValidationErrors = !isMinAdultsMet || isMaxTotalExceeded;

  // Calcula el máximo permitido para cada contador
  const maxAdults = maxTotal - children;
  const maxChildren = maxTotal - adults;

  return (
    <div className={cn('space-y-4', className)}>
      <GuestCounter
        label="Adultos"
        value={adults}
        onChange={onAdultsChange}
        min={0}
        max={maxAdults}
        hint={`Mínimo ${minAdults} adultos requeridos`}
        disabled={disabled}
      />

      <GuestCounter
        label={`Niños (hasta ${DEFAULT_PARAMETERS.MAX_CHILD_AGE} años)`}
        value={children}
        onChange={onChildrenChange}
        min={0}
        max={maxChildren}
        disabled={disabled}
      />

      {/* Resumen y validaciones */}
      <div className="pt-3 border-t border-earth-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-earth-700">Total de personas:</span>
          <span className={cn(
            'text-lg font-bold',
            hasValidationErrors ? 'text-red-600' : 'text-forest-600'
          )}>
            {total}
          </span>
        </div>

        {/* Mensajes de validación */}
        {!isMinAdultsMet && (
          <div className="flex items-start gap-2 text-xs text-red-600 mt-2">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{VALIDATION_MESSAGES.MIN_ADULTS}</span>
          </div>
        )}

        {isMaxTotalExceeded && (
          <div className="flex items-start gap-2 text-xs text-red-600 mt-2">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{VALIDATION_MESSAGES.MAX_PEOPLE}</span>
          </div>
        )}

        {isMinAdultsMet && !isMaxTotalExceeded && (
          <div className="flex items-center gap-2 text-xs text-forest-600 mt-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Capacidad válida</span>
          </div>
        )}
      </div>
    </div>
  );
};
