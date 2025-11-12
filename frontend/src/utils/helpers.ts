import { formatInTimeZone } from 'date-fns-tz';
import { differenceInDays, parseISO, isBefore, isAfter, isEqual } from 'date-fns';
import { BlockType } from '@types/index';
import { TIMEZONE } from './constants';

// ============================================
// FORMATEO DE FECHAS
// ============================================

/**
 * Formatea una fecha a string en formato YYYY-MM-DD en zona horaria de Chile
 */
export function formatDateToChile(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatInTimeZone(dateObj, TIMEZONE, 'yyyy-MM-dd');
}

/**
 * Formatea una fecha a formato legible: "Lunes 15 de Enero, 2025"
 */
export function formatDateToReadable(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatInTimeZone(dateObj, TIMEZONE, "EEEE d 'de' MMMM, yyyy", { locale: require('date-fns/locale/es') });
}

/**
 * Formatea un bloque a texto legible
 */
export function formatBlock(block: BlockType): string {
  return block === 'morning' ? 'Mañana' : 'Noche';
}

// ============================================
// CÁLCULOS DE FECHAS Y BLOQUES
// ============================================

/**
 * Calcula la duración en días y medios días entre dos fechas con bloques
 */
export function calculateDuration(
  arrivalDate: string,
  arrivalBlock: BlockType,
  departureDate: string,
  departureBlock: BlockType
): { fullDays: number; halfDays: number; totalDays: number } {
  const arrival = parseISO(arrivalDate);
  const departure = parseISO(departureDate);

  // Días completos entre fechas
  const daysDiff = differenceInDays(departure, arrival);

  // Ajustar por bloques
  let halfDays = 0;

  // Si llega en la noche, se cuenta medio día menos
  if (arrivalBlock === 'night') {
    halfDays += 1;
  }

  // Si sale en la mañana, se cuenta medio día menos
  if (departureBlock === 'morning') {
    halfDays += 1;
  }

  const fullDays = Math.max(0, daysDiff - (halfDays > 0 ? 0.5 * halfDays : 0));
  const totalDays = fullDays + halfDays * 0.5;

  return { fullDays: Math.floor(fullDays), halfDays, totalDays };
}

/**
 * Calcula el número de noches
 */
export function calculateNights(
  arrivalDate: string,
  arrivalBlock: BlockType,
  departureDate: string,
  departureBlock: BlockType
): number {
  const { totalDays } = calculateDuration(arrivalDate, arrivalBlock, departureDate, departureBlock);

  // Aproximadamente: 2 medios días = 1 noche
  return Math.floor(totalDays);
}

// ============================================
// CÁLCULOS DE PRECIOS
// ============================================

/**
 * Calcula el precio total de una reserva
 */
export function calculatePrice(
  adults: number,
  children: number,
  fullDays: number,
  halfDays: number,
  adultPricePerDay: number,
  childPricePerDay: number
): { adultSubtotal: number; childSubtotal: number; total: number } {
  const totalDays = fullDays + halfDays * 0.5;

  const adultSubtotal = Math.round(adults * adultPricePerDay * totalDays);
  const childSubtotal = Math.round(children * childPricePerDay * totalDays);
  const total = adultSubtotal + childSubtotal;

  return { adultSubtotal, childSubtotal, total };
}

/**
 * Formatea un monto en pesos chilenos
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ============================================
// VALIDACIONES DE FECHAS
// ============================================

/**
 * Verifica si una fecha está en el rango permitido
 */
export function isDateInRange(date: string, minDate: Date, maxDate: Date): boolean {
  const dateObj = parseISO(date);
  return (isAfter(dateObj, minDate) || isEqual(dateObj, minDate)) &&
         (isBefore(dateObj, maxDate) || isEqual(dateObj, maxDate));
}

/**
 * Verifica si un rango de fechas es válido (salida posterior a llegada)
 */
export function isValidDateRange(arrivalDate: string, departureDate: string): boolean {
  const arrival = parseISO(arrivalDate);
  const departure = parseISO(departureDate);
  return isBefore(arrival, departure);
}

// ============================================
// UTILIDADES DE STRINGS
// ============================================

/**
 * Combina clases CSS condicionales
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Valida formato de email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida formato de teléfono chileno (9 dígitos)
 */
export function isValidChileanPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length === 9;
}

/**
 * Formatea teléfono chileno con código de país para WhatsApp
 */
export function formatPhoneForWhatsApp(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  return `56${cleanPhone}`; // +56 (Chile)
}

/**
 * Genera URL de WhatsApp Click-to-Chat
 */
export function generateWhatsAppUrl(phone: string, message?: string): string {
  const formattedPhone = formatPhoneForWhatsApp(phone);
  const encodedMessage = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${formattedPhone}${encodedMessage}`;
}

// ============================================
// UTILIDADES DE ARRAYS
// ============================================

/**
 * Agrupa elementos de un array por una clave
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const group = String(item[key]);
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {} as Record<string, T[]>);
}
