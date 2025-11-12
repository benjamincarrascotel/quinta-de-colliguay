import { Request, Response } from 'express';
import reservationService from '../services/ReservationService';
import { CreateReservationDto } from '../dtos/reservationDtos';

// ============================================
// RESERVATION CONTROLLER (Público)
// ============================================

export class ReservationController {
  async createRequest(req: Request, res: Response) {
    const dto: CreateReservationDto = req.body;

    const reservation = await reservationService.createRequest({
      arrivalDate: dto.arrivalDate,
      arrivalBlock: dto.arrivalBlock,
      departureDate: dto.departureDate,
      departureBlock: dto.departureBlock,
      adults: dto.adults,
      children: dto.children || 0,
      estimatedAmount: dto.estimatedAmount,
      client: {
        name: dto.client.name,
        whatsapp: dto.client.whatsapp,
        email: dto.client.email,
        city: dto.client.city,
        observations: dto.client.observations,
      },
    });

    res.status(201).json({
      data: reservation,
      message: 'Solicitud de reserva creada exitosamente',
    });
  }
}

export default new ReservationController();
