import { format, parseISO, differenceInDays, isBefore, isAfter, isEqual, addDays } from 'date-fns';
import { utcToZonedTime, formatInTimeZone } from 'date-fns-tz';
import { Block } from '@prisma/client';

const TIMEZONE = 'America/Santiago';

// ============================================
// DATE FORMATTING
// ============================================

export const formatDateToChile = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatInTimeZone(dateObj, TIMEZONE, 'yyyy-MM-dd');
};

export const formatDateToReadable = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const zonedDate = utcToZonedTime(dateObj, TIMEZONE);
  return format(zonedDate, "EEEE d 'de' MMMM, yyyy", { locale: require('date-fns/locale/es') });
};

export const formatBlock = (block: Block): string => {
  return block === 'morning' ? 'Mañana' : 'Noche';
};

// ============================================
// DATE CALCULATIONS
// ============================================

export interface DurationResult {
  fullDays: number;
  halfDays: number;
  totalDays: number;
}

export const calculateDuration = (
  arrivalDate: Date | string,
  arrivalBlock: Block,
  departureDate: Date | string,
  departureBlock: Block
): DurationResult => {
  const arrival = typeof arrivalDate === 'string' ? parseISO(arrivalDate) : arrivalDate;
  const departure = typeof departureDate === 'string' ? parseISO(departureDate) : departureDate;

  const daysDiff = differenceInDays(departure, arrival);

  let halfDays = 0;

  if (arrivalBlock === 'night') {
    halfDays += 1;
  }

  if (departureBlock === 'morning') {
    halfDays += 1;
  }

  const fullDays = Math.max(0, daysDiff - (halfDays > 0 ? 0.5 * halfDays : 0));
  const totalDays = fullDays + halfDays * 0.5;

  return { fullDays: Math.floor(fullDays), halfDays, totalDays };
};

export const calculateNights = (
  arrivalDate: Date | string,
  arrivalBlock: Block,
  departureDate: Date | string,
  departureBlock: Block
): number => {
  const { totalDays } = calculateDuration(arrivalDate, arrivalBlock, departureDate, departureBlock);
  return Math.floor(totalDays);
};

// ============================================
// DATE VALIDATIONS
// ============================================

export const isDateInRange = (date: Date | string, minDate: Date, maxDate: Date): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return (
    (isAfter(dateObj, minDate) || isEqual(dateObj, minDate)) &&
    (isBefore(dateObj, maxDate) || isEqual(dateObj, maxDate))
  );
};

export const isValidDateRange = (
  arrivalDate: Date | string,
  departureDate: Date | string
): boolean => {
  const arrival = typeof arrivalDate === 'string' ? parseISO(arrivalDate) : arrivalDate;
  const departure = typeof departureDate === 'string' ? parseISO(departureDate) : departureDate;
  return isBefore(arrival, departure);
};

// ============================================
// BUFFER CALCULATION
// ============================================

export const calculateBufferDates = (
  departureDate: Date | string,
  departureBlock: Block
): { bufferDate: Date; bufferBlock: Block } => {
  const departure = typeof departureDate === 'string' ? parseISO(departureDate) : departureDate;

  if (departureBlock === 'morning') {
    // Si sale en la mañana, bloquear la noche del mismo día
    return {
      bufferDate: departure,
      bufferBlock: 'night',
    };
  } else {
    // Si sale en la noche, bloquear la mañana del día siguiente
    return {
      bufferDate: addDays(departure, 1),
      bufferBlock: 'morning',
    };
  }
};
