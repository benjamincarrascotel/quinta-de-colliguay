import { Router } from 'express';
import availabilityController from '../controllers/AvailabilityController';
import reservationController from '../controllers/ReservationController';
import adminReservationController from '../controllers/AdminReservationController';
import parametersController from '../controllers/ParametersController';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/auth';
import { publicLimiter, createReservationLimiter } from '../middlewares/rateLimiter';
import { CreateReservationDto, UpdateReservationDto, ConfirmReservationDto, CancelReservationDto } from '../dtos/reservationDtos';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// ============================================
// PUBLIC ROUTES
// ============================================

// Availability
router.get('/availability', publicLimiter, asyncHandler(availabilityController.getAvailability.bind(availabilityController)));

// Parameters
router.get('/parameters', publicLimiter, asyncHandler(parametersController.getParameters.bind(parametersController)));

// Create reservation request
router.post(
  '/requests',
  createReservationLimiter,
  validate(CreateReservationDto),
  asyncHandler(reservationController.createRequest.bind(reservationController))
);

// ============================================
// ADMIN ROUTES (Protected)
// ============================================

// List reservations
router.get('/admin/requests', authenticate, asyncHandler(adminReservationController.list.bind(adminReservationController)));

// Get reservation detail
router.get('/admin/requests/:id', authenticate, asyncHandler(adminReservationController.show.bind(adminReservationController)));

// Update reservation
router.patch(
  '/admin/requests/:id',
  authenticate,
  validate(UpdateReservationDto),
  asyncHandler(adminReservationController.update.bind(adminReservationController))
);

// Confirm reservation
router.post(
  '/admin/requests/:id/confirm',
  authenticate,
  validate(ConfirmReservationDto),
  asyncHandler(adminReservationController.confirm.bind(adminReservationController))
);

// Cancel reservation
router.post(
  '/admin/requests/:id/cancel',
  authenticate,
  validate(CancelReservationDto),
  asyncHandler(adminReservationController.cancel.bind(adminReservationController))
);

// Download calendar (.ics)
router.get('/admin/requests/:id/calendar', authenticate, asyncHandler(adminReservationController.downloadCalendar.bind(adminReservationController)));

// Export CSV
router.get('/admin/requests/export/csv', authenticate, asyncHandler(adminReservationController.exportCsv.bind(adminReservationController)));

export default router;
