import { Router } from 'express';
import availabilityController from '../controllers/AvailabilityController';
import reservationController from '../controllers/ReservationController';
import adminReservationController from '../controllers/AdminReservationController';
import parametersController from '../controllers/ParametersController';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/auth';
import { publicLimiter, createReservationLimiter } from '../middlewares/rateLimiter';
import { CreateReservationDto, UpdateReservationDto, ConfirmReservationDto, CancelReservationDto } from '../dtos/reservationDtos';

const router = Router();

// ============================================
// PUBLIC ROUTES
// ============================================

// Availability
router.get('/availability', publicLimiter, availabilityController.getAvailability);

// Parameters
router.get('/parameters', publicLimiter, parametersController.getParameters);

// Create reservation request
router.post(
  '/requests',
  createReservationLimiter,
  validate(CreateReservationDto),
  reservationController.createRequest
);

// ============================================
// ADMIN ROUTES (Protected)
// ============================================

// List reservations
router.get('/admin/requests', authenticate, adminReservationController.list);

// Get reservation detail
router.get('/admin/requests/:id', authenticate, adminReservationController.show);

// Update reservation
router.patch(
  '/admin/requests/:id',
  authenticate,
  validate(UpdateReservationDto),
  adminReservationController.update
);

// Confirm reservation
router.post(
  '/admin/requests/:id/confirm',
  authenticate,
  validate(ConfirmReservationDto),
  adminReservationController.confirm
);

// Cancel reservation
router.post(
  '/admin/requests/:id/cancel',
  authenticate,
  validate(CancelReservationDto),
  adminReservationController.cancel
);

// Download calendar (.ics)
router.get('/admin/requests/:id/calendar', authenticate, adminReservationController.downloadCalendar);

// Export CSV
router.get('/admin/requests/export/csv', authenticate, adminReservationController.exportCsv);

export default router;
