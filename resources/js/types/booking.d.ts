/**
 * BOOKING TYPE DEFINITIONS
 *
 * TypeScript interfaces for the booking system.
 */

/**
 * Booking form data submitted by the user
 */
export interface BookingFormData {
  fullName: string;
  email: string;
  phone: string;
  guestCount: number;
  specialRequests: string;
}

/**
 * Complete booking data sent to backend
 */
export interface BookingSubmission {
  check_in: string; // YYYY-MM-DD format
  check_out: string; // YYYY-MM-DD format
  full_name: string;
  email: string;
  phone: string;
  guest_count: number;
  special_requests?: string;
}

/**
 * Booking model from database
 */
export interface Booking {
  id: number;
  confirmation_code: string;
  check_in: string; // YYYY-MM-DD format
  check_out: string; // YYYY-MM-DD format
  full_name: string;
  email: string;
  phone: string;
  guest_count: number;
  special_requests?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

/**
 * Availability data for a specific date
 */
export interface AvailabilityData {
  date: string; // YYYY-MM-DD format
  morning_available: boolean;
  night_available: boolean;
}

/**
 * Date range selection
 */
export interface SelectedRange {
  from: Date | null;
  to: Date | null;
}

/**
 * Validation errors for form fields
 */
export interface BookingFormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  guestCount?: string;
}
