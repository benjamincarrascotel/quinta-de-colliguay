import { Request, Response } from 'express';
import reservationService from '../services/ReservationService';
import icsService from '../services/ICSService';
import {
  UpdateReservationDto,
  ConfirmReservationDto,
  CancelReservationDto,
} from '../dtos/reservationDtos';

// ============================================
// ADMIN RESERVATION CONTROLLER
// ============================================

export class AdminReservationController {
  async list(req: Request, res: Response) {
    const { status, from_date, to_date, page, per_page } = req.query;

    const result = await reservationService.listRequests({
      status: status as string,
      fromDate: from_date as string,
      toDate: to_date as string,
      page: page ? parseInt(page as string, 10) : undefined,
      perPage: per_page ? parseInt(per_page as string, 10) : undefined,
    });

    res.json({
      data: result.data,
      meta: {
        total: result.total,
        page: result.page,
        per_page: result.perPage,
        last_page: Math.ceil(result.total / result.perPage),
      },
      links: {
        first: `?page=1&per_page=${result.perPage}`,
        last: `?page=${Math.ceil(result.total / result.perPage)}&per_page=${result.perPage}`,
        prev: result.page > 1 ? `?page=${result.page - 1}&per_page=${result.perPage}` : null,
        next:
          result.page < Math.ceil(result.total / result.perPage)
            ? `?page=${result.page + 1}&per_page=${result.perPage}`
            : null,
      },
    });
  }

  async show(req: Request, res: Response) {
    const { id } = req.params;

    const reservation = await reservationService.getRequest(parseInt(id, 10));

    res.json({
      data: reservation,
    });
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const dto: UpdateReservationDto = req.body;

    const reservation = await reservationService.updateRequest(parseInt(id, 10), dto);

    res.json({
      data: reservation,
      message: 'Reserva actualizada exitosamente',
    });
  }

  async confirm(req: Request, res: Response) {
    const { id } = req.params;
    const dto: ConfirmReservationDto = req.body;

    const reservation = await reservationService.confirmRequest(parseInt(id, 10), dto);

    res.json({
      data: reservation,
      message: 'Reserva confirmada exitosamente',
    });
  }

  async cancel(req: Request, res: Response) {
    const { id } = req.params;
    const dto: CancelReservationDto = req.body;

    const reservation = await reservationService.cancelRequest(parseInt(id, 10), dto.reason);

    res.json({
      data: reservation,
      message: 'Reserva cancelada exitosamente',
    });
  }

  async downloadCalendar(req: Request, res: Response) {
    const { id } = req.params;

    const reservation = await reservationService.getRequest(parseInt(id, 10));

    const icsBuffer = icsService.generateCalendarFile(reservation);

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="reserva-${id}.ics"`);
    res.send(icsBuffer);
  }

  async exportCsv(req: Request, res: Response) {
    const { status, from_date, to_date } = req.query;

    const result = await reservationService.listRequests({
      status: status as string,
      fromDate: from_date as string,
      toDate: to_date as string,
      perPage: 10000, // All records
    });

    // Generate CSV
    const headers = [
      'ID',
      'Cliente',
      'Email',
      'WhatsApp',
      'Llegada',
      'Salida',
      'Adultos',
      'Niños',
      'Estado',
      'Monto',
      'Fecha Creación',
    ];

    const rows = result.data.map((r: any) => [
      r.id,
      r.client?.name || '',
      r.client?.email || '',
      r.client?.whatsapp || '',
      r.arrivalDate.toISOString().split('T')[0],
      r.departureDate.toISOString().split('T')[0],
      r.adults,
      r.children,
      r.status,
      r.finalAmount || r.estimatedAmount,
      r.createdAt.toISOString().split('T')[0],
    ]);

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="reservas.csv"');
    res.send(csv);
  }
}

export default new AdminReservationController();
