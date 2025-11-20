import { Check, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const steps = [
    { number: 1, label: 'Fechas' },
    { number: 2, label: 'Datos' },
    { number: 3, label: 'Confirmar' },
  ];

  return (
    <div className="border-b bg-muted/30">
      <div className="container mx-auto py-6">
        <ol className="flex items-center justify-center gap-2 md:gap-4">
          {steps.map((step, index) => (
            <li key={step.number} className="flex items-center gap-2">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors md:h-10 md:w-10',
                  current >= step.number
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {current > step.number ? (
                  <Check className="h-4 w-4 md:h-5 md:w-5" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={cn(
                  'hidden text-sm font-medium sm:inline md:text-base',
                  current >= step.number
                    ? 'text-foreground'
                    : 'text-muted-foreground',
                )}
              >
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground md:h-5 md:w-5" />
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
