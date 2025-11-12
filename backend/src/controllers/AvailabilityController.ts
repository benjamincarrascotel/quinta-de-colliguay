import { Request, Response } from 'express';
import availabilityService from '../services/AvailabilityService';
import { ValidationError } from '../middlewares/errorHandler';

// ============================================
// AVAILABILITY CONTROLLER
// ============================================

export class AvailabilityController {
  async getAvailability(req: Request, res: Response) {
    const { from, to } = req.query;

    if (!from || !to) {
      throw new ValidationError('Los parámetros "from" y "to" son obligatorios');
    }

    const availability = await availabilityService.getAvailability(
      from as string,
      to as string
    );

    res.json({
      data: {
        from: from as string,
        to: to as string,
        dates: availability,
      },
    });
  }
}

export default new AvailabilityController();
