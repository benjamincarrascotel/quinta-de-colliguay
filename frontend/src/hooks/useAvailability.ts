import { useCallback, useMemo } from 'react';
import { useQuery } from './useApi';
import { reservationService } from '@services/reservationService';
import { AvailabilityRange, DateAvailability, BlockType } from '@types/index';
import { formatDateToChile } from '@utils/helpers';

// ============================================
// USE AVAILABILITY - Hook para manejar disponibilidad del calendario
// ============================================

export interface UseAvailabilityOptions {
  from: Date;
  to: Date;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseAvailabilityResult {
  availability: AvailabilityRange | null;
  isLoading: boolean;
  error: any;
  refetch: () => Promise<void>;
  isDateAvailable: (date: string, block?: BlockType) => boolean;
  getDateAvailability: (date: string) => DateAvailability | undefined;
  isRangeAvailable: (startDate: string, endDate: string) => boolean;
}

export function useAvailability(options: UseAvailabilityOptions): UseAvailabilityResult {
  const { from, to, autoRefresh = false, refreshInterval = 60000 } = options;

  // Fetch availability
  const {
    data: availability,
    isLoading,
    error,
    refetch,
  } = useQuery<AvailabilityRange>(
    `availability-${formatDateToChile(from)}-${formatDateToChile(to)}`,
    () => reservationService.getAvailability(formatDateToChile(from), formatDateToChile(to)),
    {
      enabled: true,
      refetchInterval: autoRefresh ? refreshInterval : undefined,
      cacheTime: 5 * 60 * 1000, // 5 minutos de caché
    }
  );

  // Verifica si una fecha y bloque específico está disponible
  const isDateAvailable = useCallback(
    (date: string, block?: BlockType): boolean => {
      if (!availability) return false;

      const dateAvailability = availability.dates.find((d) => d.date === date);
      if (!dateAvailability) return false;

      if (!block) {
        return dateAvailability.morning_available || dateAvailability.night_available;
      }

      return block === 'morning'
        ? dateAvailability.morning_available
        : dateAvailability.night_available;
    },
    [availability]
  );

  // Obtiene la disponibilidad de una fecha
  const getDateAvailability = useCallback(
    (date: string): DateAvailability | undefined => {
      if (!availability) return undefined;
      return availability.dates.find((d) => d.date === date);
    },
    [availability]
  );

  // Verifica si un rango completo está disponible
  const isRangeAvailable = useCallback(
    (startDate: string, endDate: string): boolean => {
      if (!availability) return false;

      const datesInRange = availability.dates.filter((d) => d.date >= startDate && d.date <= endDate);

      // Todos los días en el rango deben tener al menos un bloque disponible
      return datesInRange.every((d) => d.morning_available || d.night_available);
    },
    [availability]
  );

  return {
    availability,
    isLoading,
    error,
    refetch,
    isDateAvailable,
    getDateAvailability,
    isRangeAvailable,
  };
}
