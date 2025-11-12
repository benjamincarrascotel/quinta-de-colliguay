import { Reservation, Block } from '@prisma/client';
import reservationRepository from '../repositories/ReservationRepository';
import clientRepository from '../repositories/ClientRepository';
import parameterRepository from '../repositories/SystemParameterRepository';
import availabilityService from './AvailabilityService';
import emailService from './EmailService';
import {
  ValidationError,
  NotFoundError,
  ConflictError,
} from '../middlewares/errorHandler';
import { calculateDuration, calculateNights } from '../utils/dateHelpers';
import { calculatePrice } from '../utils/priceHelpers';
import { parseISO } from 'date-fns';

// ============================================
// RESERVATION SERVICE
// Lógica de negocio principal
// ============================================

export interface CreateReservationData {
  arrivalDate: string;
  arrivalBlock: Block;
  departureDate: string;
  departureBlock: Block;
  adults: number;
  children: number;
  estimatedAmount: number;
  client: {
    name: string;
    whatsapp: string;
    email: string;
    city: string;
    observations?: string;
  };
}

export class ReservationService {
  async createRequest(data: CreateReservationData): Promise<Reservation> {
    // Validar parámetros del sistema
    await this.validateReservationRules(
      data.arrivalDate,
      data.arrivalBlock,
      data.departureDate,
      data.departureBlock,
      data.adults,
      data.children
    );

    // Verificar disponibilidad
    const isAvailable = await availabilityService.isRangeAvailable(
      data.arrivalDate,
      data.arrivalBlock,
      data.departureDate,
      data.departureBlock
    );

    if (!isAvailable) {
      throw new ConflictError('Las fechas seleccionadas no están disponibles');
    }

    // Crear o encontrar cliente
    const client = await clientRepository.findOrCreate({
      name: data.client.name,
      whatsapp: data.client.whatsapp,
      email: data.client.email,
      city: data.client.city,
    });

    // Crear reserva
    const reservation = await reservationRepository.create({
      client: {
        connect: { id: client.id },
      },
      arrivalDate: parseISO(data.arrivalDate),
      arrivalBlock: data.arrivalBlock,
      departureDate: parseISO(data.departureDate),
      departureBlock: data.departureBlock,
      adults: data.adults,
      children: data.children,
      estimatedAmount: data.estimatedAmount,
      status: 'requested',
      clientObservations: data.client.observations,
    });

    // Enviar notificaciones
    await emailService.sendRequestCreatedToClient(reservation);
    await emailService.sendRequestCreatedToAdmin(reservation);

    return reservation;
  }

  async getRequest(id: number): Promise<Reservation> {
    const reservation = await reservationRepository.findById(id);

    if (!reservation) {
      throw new NotFoundError('Reserva no encontrada');
    }

    return reservation;
  }

  async updateRequest(
    id: number,
    data: Partial<CreateReservationData>
  ): Promise<Reservation> {
    const existing = await this.getRequest(id);

    // Si se actualizan fechas, validar
    if (
      data.arrivalDate ||
      data.arrivalBlock ||
      data.departureDate ||
      data.departureBlock ||
      data.adults !== undefined ||
      data.children !== undefined
    ) {
      const arrivalDate = data.arrivalDate || existing.arrivalDate.toISOString().split('T')[0];
      const arrivalBlock = data.arrivalBlock || existing.arrivalBlock;
      const departureDate =
        data.departureDate || existing.departureDate.toISOString().split('T')[0];
      const departureBlock = data.departureBlock || existing.departureBlock;
      const adults = data.adults ?? existing.adults;
      const children = data.children ?? existing.children;

      // Validar reglas
      await this.validateReservationRules(
        arrivalDate,
        arrivalBlock,
        departureDate,
        departureBlock,
        adults,
        children
      );

      // Verificar disponibilidad (excluyendo esta reserva si está confirmada)
      const isAvailable = await availabilityService.isRangeAvailable(
        arrivalDate,
        arrivalBlock,
        departureDate,
        departureBlock,
        existing.status === 'confirmed' ? id : undefined
      );

      if (!isAvailable) {
        throw new ConflictError('Las fechas actualizadas no están disponibles');
      }
    }

    // Actualizar
    return reservationRepository.update(id, {
      ...(data.arrivalDate && { arrivalDate: parseISO(data.arrivalDate) }),
      ...(data.arrivalBlock && { arrivalBlock: data.arrivalBlock }),
      ...(data.departureDate && { departureDate: parseISO(data.departureDate) }),
      ...(data.departureBlock && { departureBlock: data.departureBlock }),
      ...(data.adults !== undefined && { adults: data.adults }),
      ...(data.children !== undefined && { children: data.children }),
      ...(data.client?.observations !== undefined && {
        clientObservations: data.client.observations,
      }),
    });
  }

  async confirmRequest(
    id: number,
    depositData: {
      depositAmount: number;
      depositDate: string;
      depositMethod?: string;
      depositReference?: string;
      finalAmount?: number;
    }
  ): Promise<Reservation> {
    const existing = await this.getRequest(id);

    if (existing.status === 'confirmed') {
      throw new ValidationError('La reserva ya está confirmada');
    }

    if (existing.status === 'cancelled') {
      throw new ValidationError('No se puede confirmar una reserva cancelada');
    }

    // Confirmar
    const reservation = await reservationRepository.confirm(id, {
      ...depositData,
      depositDate: parseISO(depositData.depositDate),
    });

    // Enviar notificaciones con .ics
    await emailService.sendConfirmedToClient(reservation);
    await emailService.sendConfirmedToAdmin(reservation);

    return reservation;
  }

  async cancelRequest(id: number, reason: string): Promise<Reservation> {
    const existing = await this.getRequest(id);

    if (existing.status === 'cancelled') {
      throw new ValidationError('La reserva ya está cancelada');
    }

    // Cancelar
    const reservation = await reservationRepository.cancel(id, reason);

    // Enviar notificaciones
    await emailService.sendCancelledToClient(reservation);
    await emailService.sendCancelledToAdmin(reservation);

    return reservation;
  }

  async listRequests(params?: {
    status?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    perPage?: number;
  }): Promise<{ data: Reservation[]; total: number; page: number; perPage: number }> {
    const result = await reservationRepository.findAll({
      ...(params?.status && { status: params.status as any }),
      ...(params?.fromDate && { fromDate: parseISO(params.fromDate) }),
      ...(params?.toDate && { toDate: parseISO(params.toDate) }),
      page: params?.page,
      perPage: params?.perPage,
    });

    return {
      ...result,
      page: params?.page || 1,
      perPage: params?.perPage || 15,
    };
  }

  // ==========================================
  // VALIDACIONES
  // ==========================================

  private async validateReservationRules(
    arrivalDate: string,
    arrivalBlock: Block,
    departureDate: string,
    departureBlock: Block,
    adults: number,
    children: number
  ): Promise<void> {
    // Obtener parámetros
    const minAdults = await parameterRepository.get<number>('min_adults', 20);
    const maxTotal = await parameterRepository.get<number>('max_total_people', 60);
    const minNights = await parameterRepository.get<number>('min_nights', 2);

    // Validar adultos mínimos
    if (adults < minAdults) {
      throw new ValidationError(`Se requiere un mínimo de ${minAdults} adultos`);
    }

    // Validar máximo total
    const total = adults + children;
    if (total > maxTotal) {
      throw new ValidationError(
        `El máximo total es ${maxTotal} personas (adultos + niños)`
      );
    }

    // Validar noches mínimas
    const nights = calculateNights(arrivalDate, arrivalBlock, departureDate, departureBlock);

    if (nights < minNights) {
      throw new ValidationError(`La estancia mínima es de ${minNights} noches`);
    }

    // Validar que la fecha de salida sea posterior a la de llegada
    if (new Date(departureDate) <= new Date(arrivalDate)) {
      throw new ValidationError('La fecha de salida debe ser posterior a la de llegada');
    }
  }
}

export default new ReservationService();
