import ical, { ICalCalendar, ICalEventData } from 'ical-generator';
import { Reservation } from '@prisma/client';
import { formatBlock } from '../utils/dateHelpers';
import { config } from '../config';

// ============================================
// ICS SERVICE
// Genera archivos .ics para calendario
// ============================================

export class ICSService {
  generateReservationEvent(reservation: Reservation & { client?: any }): string {
    const calendar = ical({ name: 'Quinta de Colliguay - Reservas' });

    const eventData: ICalEventData = {
      start: reservation.arrivalDate,
      end: reservation.departureDate,
      summary: `Reserva - ${reservation.client?.name || 'Cliente'}`,
      description: this.buildDescription(reservation),
      location: 'Quinta de Colliguay, Colliguay, Chile',
      url: `${config.cors.allowedOrigins[0]}/admin/reservations/${reservation.id}`,
      organizer: {
        name: 'Quinta de Colliguay',
        email: config.admin.email,
      },
      attendees: reservation.client
        ? [
            {
              name: reservation.client.name,
              email: reservation.client.email,
              rsvp: true,
            },
          ]
        : [],
    };

    calendar.createEvent(eventData);

    return calendar.toString();
  }

  private buildDescription(reservation: Reservation & { client?: any }): string {
    const lines: string[] = [];

    lines.push('RESERVA CONFIRMADA - QUINTA DE COLLIGUAY');
    lines.push('');
    lines.push(`Reserva #${reservation.id}`);
    lines.push('');

    if (reservation.client) {
      lines.push('DATOS DEL CLIENTE:');
      lines.push(`Nombre: ${reservation.client.name}`);
      lines.push(`Email: ${reservation.client.email}`);
      lines.push(`WhatsApp: ${reservation.client.whatsapp}`);
      lines.push(`Ciudad: ${reservation.client.city}`);
      lines.push('');
    }

    lines.push('DETALLES DE LA RESERVA:');
    lines.push(
      `Llegada: ${reservation.arrivalDate.toISOString().split('T')[0]} - ${formatBlock(
        reservation.arrivalBlock
      )}`
    );
    lines.push(
      `Salida: ${reservation.departureDate.toISOString().split('T')[0]} - ${formatBlock(
        reservation.departureBlock
      )}`
    );
    lines.push(`Adultos: ${reservation.adults}`);
    lines.push(`Niños: ${reservation.children}`);
    lines.push(`Total personas: ${reservation.adults + reservation.children}`);
    lines.push('');

    if (reservation.finalAmount) {
      lines.push(`Monto total: $${reservation.finalAmount.toLocaleString('es-CL')} CLP`);
    }

    if (reservation.depositAmount) {
      lines.push(`Anticipo: $${reservation.depositAmount.toLocaleString('es-CL')} CLP`);
    }

    if (reservation.clientObservations) {
      lines.push('');
      lines.push('OBSERVACIONES DEL CLIENTE:');
      lines.push(reservation.clientObservations);
    }

    lines.push('');
    lines.push('POLÍTICAS:');
    lines.push('- Cancelación ≥7 días: reembolsable');
    lines.push('- Cancelación <7 días: no reembolsable');
    lines.push('- Check-in: según bloque seleccionado');
    lines.push('- Check-out: según bloque seleccionado');

    return lines.join('\\n');
  }

  generateCalendarFile(reservation: Reservation & { client?: any }): Buffer {
    const icsContent = this.generateReservationEvent(reservation);
    return Buffer.from(icsContent, 'utf-8');
  }
}

export default new ICSService();
