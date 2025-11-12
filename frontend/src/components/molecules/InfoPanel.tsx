import { ReactNode } from 'react';
import { Card } from './Card';
import { cn } from '@utils/helpers';

// ============================================
// INFO PANEL - Panel informativo abstracto
// Usado para mostrar requisitos, políticas, información importante
// ============================================

export interface InfoItem {
  icon?: ReactNode;
  title: string;
  description: string;
}

export interface InfoPanelProps {
  title?: string;
  items: InfoItem[];
  variant?: 'default' | 'compact';
  className?: string;
}

const defaultIcon = (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
      clipRule="evenodd"
    />
  </svg>
);

export const InfoPanel = ({ title, items, variant = 'default', className }: InfoPanelProps) => {
  if (variant === 'compact') {
    return (
      <Card padding="sm" className={cn('bg-water-50 border-water-200', className)}>
        {title && <h4 className="font-semibold text-water-900 mb-2">{title}</h4>}
        <div className="space-y-1.5">
          {items.map((item, index) => (
            <div key={index} className="flex gap-2 text-sm">
              <div className="flex-shrink-0 text-water-600 mt-0.5">
                {item.icon || defaultIcon}
              </div>
              <div className="flex-1">
                <span className="font-medium text-water-900">{item.title}:</span>{' '}
                <span className="text-water-700">{item.description}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('bg-gradient-to-br from-forest-50 to-water-50 border-forest-200', className)}>
      {title && <h3 className="text-lg font-semibold text-earth-900 mb-4">{title}</h3>}
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-white rounded-lg flex items-center justify-center text-forest-600 shadow-sm">
              {item.icon || defaultIcon}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-earth-900">{item.title}</h4>
              <p className="text-sm text-earth-700 mt-0.5">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// ============================================
// REQUIREMENT PANEL - Variante específica para requisitos
// ============================================

export interface RequirementPanelProps {
  minAdults: number;
  maxTotal: number;
  minNights: number;
  childMaxAge: number;
  className?: string;
}

export const RequirementPanel = ({
  minAdults,
  maxTotal,
  minNights,
  childMaxAge,
  className,
}: RequirementPanelProps) => {
  const items: InfoItem[] = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      title: 'Capacidad',
      description: `Mínimo ${minAdults} adultos, máximo ${maxTotal} personas total. Niños hasta ${childMaxAge} años.`,
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      title: 'Estancia Mínima',
      description: `${minNights} ${minNights === 1 ? 'noche' : 'noches'} mínimas requeridas.`,
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: 'Anticipo',
      description: 'Se requiere un anticipo para confirmar la reserva.',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: 'Cancelación',
      description: '≥7 días: reembolsable. <7 días: no reembolsable.',
    },
  ];

  return <InfoPanel title="Requisitos y Políticas" items={items} className={className} />;
};
