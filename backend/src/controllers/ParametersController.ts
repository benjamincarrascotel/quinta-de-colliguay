import { Request, Response } from 'express';
import parameterRepository from '../repositories/SystemParameterRepository';

// ============================================
// PARAMETERS CONTROLLER
// ============================================

export class ParametersController {
  async getParameters(req: Request, res: Response) {
    const parameters = await parameterRepository.getAll();

    res.json({
      data: {
        adult_price_per_day: parameters.adult_price_per_day || 20000,
        child_price_per_day: parameters.child_price_per_day || 10000,
        min_adults: parameters.min_adults || 20,
        max_total_people: parameters.max_total_people || 60,
        min_nights: parameters.min_nights || 2,
        buffer_half_day: parameters.buffer_half_day !== false,
        max_child_age: parameters.max_child_age || 10,
        cancellation_refundable_days: parameters.cancellation_refundable_days || 7,
        timezone: parameters.timezone || 'America/Santiago',
      },
    });
  }
}

export default new ParametersController();
