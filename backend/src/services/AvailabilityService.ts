import { Block } from '@prisma/client';
import reservationRepository from '../repositories/ReservationRepository';
import { parseISO, addDays, isSameDay, differenceInDays } from 'date-fns';
import { calculateBufferDates } from '../utils/dateHelpers';

// ============================================
// AVAILABILITY SERVICE
// Calcula disponibilidad considerando buffer de limpieza
// ============================================

export interface DateAvailability {
  date: string;
  morningAvailable: boolean;
  nightAvailable: boolean;
  reservationId?: number;
}

export class AvailabilityService {
  async getAvailability(fromDate: string, toDate: string): Promise<DateAvailability[]> {
    const start = parseISO(fromDate);
    const end = parseISO(toDate);

    // Obtener todas las reservas confirmadas en el rango (con margen para buffer)
    const bufferMargin = 1; // 1 día de margen para cálculo de buffer
    const confirmedReservations = await reservationRepository.findConfirmedInRange(
      addDays(start, -bufferMargin),
      addDays(end, bufferMargin)
    );

    // Generar array de fechas
    const dates: DateAvailability[] = [];
    const totalDays = differenceInDays(end, start) + 1;

    for (let i = 0; i < totalDays; i++) {
      const currentDate = addDays(start, i);
      const dateStr = currentDate.toISOString().split('T')[0];

      dates.push({
        date: dateStr,
        morningAvailable: true,
        nightAvailable: true,
      });
    }

    // Marcar bloques ocupados por reservas confirmadas
    confirmedReservations.forEach((reservation) => {
      const arrivalDate = new Date(reservation.arrivalDate);
      const departureDate = new Date(reservation.departureDate);

      // Marcar días ocupados por la reserva
      dates.forEach((dateObj) => {
        const current = parseISO(dateObj.date);

        // Si es el día de llegada
        if (isSameDay(current, arrivalDate)) {
          if (reservation.arrivalBlock === 'morning') {
            dateObj.morningAvailable = false;
            dateObj.nightAvailable = false;
          } else {
            dateObj.nightAvailable = false;
          }
          dateObj.reservationId = reservation.id;
        }
        // Si es el día de salida
        else if (isSameDay(current, departureDate)) {
          if (reservation.departureBlock === 'night') {
            dateObj.morningAvailable = false;
            dateObj.nightAvailable = false;
          } else {
            dateObj.morningAvailable = false;
          }
          dateObj.reservationId = reservation.id;
        }
        // Si está entre llegada y salida
        else if (current > arrivalDate && current < departureDate) {
          dateObj.morningAvailable = false;
          dateObj.nightAvailable = false;
          dateObj.reservationId = reservation.id;
        }
      });

      // Aplicar buffer de limpieza
      const { bufferDate, bufferBlock } = calculateBufferDates(
        reservation.departureDate,
        reservation.departureBlock
      );

      const bufferDateObj = dates.find((d) => isSameDay(parseISO(d.date), bufferDate));

      if (bufferDateObj) {
        if (bufferBlock === 'morning') {
          bufferDateObj.morningAvailable = false;
        } else {
          bufferDateObj.nightAvailable = false;
        }
      }
    });

    return dates;
  }

  async isRangeAvailable(
    arrivalDate: string,
    arrivalBlock: Block,
    departureDate: string,
    departureBlock: Block,
    excludeReservationId?: number
  ): Promise<boolean> {
    const availability = await this.getAvailability(arrivalDate, departureDate);

    const arrival = parseISO(arrivalDate);
    const departure = parseISO(departureDate);

    // Verificar cada día del rango
    for (const dateObj of availability) {
      const current = parseISO(dateObj.date);

      // Día de llegada
      if (isSameDay(current, arrival)) {
        if (arrivalBlock === 'morning') {
          if (!dateObj.morningAvailable || !dateObj.nightAvailable) {
            // Si hay reserva, verificar que no sea la que estamos excluyendo
            if (!excludeReservationId || dateObj.reservationId !== excludeReservationId) {
              return false;
            }
          }
        } else {
          if (!dateObj.nightAvailable) {
            if (!excludeReservationId || dateObj.reservationId !== excludeReservationId) {
              return false;
            }
          }
        }
      }
      // Día de salida
      else if (isSameDay(current, departure)) {
        if (departureBlock === 'night') {
          if (!dateObj.morningAvailable || !dateObj.nightAvailable) {
            if (!excludeReservationId || dateObj.reservationId !== excludeReservationId) {
              return false;
            }
          }
        } else {
          if (!dateObj.morningAvailable) {
            if (!excludeReservationId || dateObj.reservationId !== excludeReservationId) {
              return false;
            }
          }
        }
      }
      // Días intermedios
      else if (current > arrival && current < departure) {
        if (!dateObj.morningAvailable || !dateObj.nightAvailable) {
          if (!excludeReservationId || dateObj.reservationId !== excludeReservationId) {
            return false;
          }
        }
      }
    }

    return true;
  }
}

export default new AvailabilityService();
