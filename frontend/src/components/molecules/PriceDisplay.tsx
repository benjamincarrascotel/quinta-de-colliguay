import { cn, formatCurrency } from '@utils/helpers';
import type { PriceBreakdown } from '@/types/index';

// ============================================
// PRICE DISPLAY - Componente abstracto para mostrar precios
// ============================================

export interface PriceDisplayProps {
  breakdown: PriceBreakdown;
  showBreakdown?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
}

export const PriceDisplay = ({
  breakdown,
  showBreakdown = true,
  className,
  variant = 'default',
}: PriceDisplayProps) => {
  const { adults, children, full_days, half_days, adult_subtotal, child_subtotal, total } = breakdown;

  if (variant === 'compact') {
    return (
      <div className={cn('text-right', className)}>
        <div className="text-2xl font-bold text-forest-700">{formatCurrency(total)}</div>
        <div className="text-xs text-earth-600">Total estimado</div>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={cn('card space-y-4', className)}>
        <h3 className="text-lg font-semibold text-earth-900">Desglose de Precios</h3>

        <div className="space-y-2 text-sm">
          {/* Composición de grupo */}
          <div className="flex justify-between text-earth-700">
            <span>Adultos:</span>
            <span className="font-medium">{adults}</span>
          </div>
          {children > 0 && (
            <div className="flex justify-between text-earth-700">
              <span>Niños:</span>
              <span className="font-medium">{children}</span>
            </div>
          )}

          <div className="border-t border-earth-200 pt-2" />

          {/* Duración */}
          <div className="flex justify-between text-earth-700">
            <span>Días completos:</span>
            <span className="font-medium">{full_days}</span>
          </div>
          {half_days > 0 && (
            <div className="flex justify-between text-earth-700">
              <span>Medios días:</span>
              <span className="font-medium">{half_days}</span>
            </div>
          )}

          <div className="border-t border-earth-200 pt-2" />

          {/* Subtotales */}
          <div className="flex justify-between text-earth-700">
            <span>Subtotal adultos:</span>
            <span className="font-medium">{formatCurrency(adult_subtotal)}</span>
          </div>
          {child_subtotal > 0 && (
            <div className="flex justify-between text-earth-700">
              <span>Subtotal niños:</span>
              <span className="font-medium">{formatCurrency(child_subtotal)}</span>
            </div>
          )}
        </div>

        <div className="border-t-2 border-forest-200 pt-3">
          <div className="flex justify-between items-baseline">
            <span className="text-base font-semibold text-earth-900">Total Estimado:</span>
            <span className="text-2xl font-bold text-forest-700">{formatCurrency(total)}</span>
          </div>
          <p className="text-xs text-earth-600 mt-1 text-right">
            * Precio estimado, sujeto a confirmación
          </p>
        </div>
      </div>
    );
  }

  // Variant 'default'
  return (
    <div className={cn('space-y-3', className)}>
      {showBreakdown && (
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-earth-700">
            <span>{adults} adultos × {full_days + half_days * 0.5} días</span>
            <span className="font-medium">{formatCurrency(adult_subtotal)}</span>
          </div>
          {child_subtotal > 0 && (
            <div className="flex justify-between text-earth-700">
              <span>{children} niños × {full_days + half_days * 0.5} días</span>
              <span className="font-medium">{formatCurrency(child_subtotal)}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between items-baseline pt-2 border-t border-earth-200">
        <span className="text-sm font-semibold text-earth-900">Total:</span>
        <span className="text-xl font-bold text-forest-700">{formatCurrency(total)}</span>
      </div>
    </div>
  );
};

// ============================================
// PRICE SUMMARY CARD - Variante con card
// ============================================

export interface PriceSummaryCardProps extends Omit<PriceDisplayProps, 'variant'> {
  title?: string;
  description?: string;
}

export const PriceSummaryCard = ({
  title = 'Resumen de Precios',
  description,
  ...props
}: PriceSummaryCardProps) => {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-earth-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-earth-600 mb-4">{description}</p>}
      <PriceDisplay variant="detailed" {...props} />
    </div>
  );
};
