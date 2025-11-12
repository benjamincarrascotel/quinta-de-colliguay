// ============================================
// TIPOS BASE DEL SISTEMA
// ============================================

export type BlockType = 'morning' | 'night';
export type ReservationStatus = 'requested' | 'confirmed' | 'cancelled';

// ============================================
// CLIENTE
// ============================================
export interface Client {
  id: number;
  name: string;
  whatsapp: string;
  email: string;
  city: string;
  created_at: string;
  updated_at: string;
}

export interface ClientInput {
  name: string;
  whatsapp: string;
  email: string;
  city: string;
  observations?: string;
}

// ============================================
// RESERVA
// ============================================
export interface Reservation {
  id: number;
  client_id: number;
  client?: Client;
  arrival_date: string; // YYYY-MM-DD
  arrival_block: BlockType;
  departure_date: string; // YYYY-MM-DD
  departure_block: BlockType;
  adults: number;
  children: number;
  status: ReservationStatus;
  estimated_amount: number;
  final_amount?: number;
  deposit_amount?: number;
  deposit_date?: string;
  client_observations?: string;
  admin_observations?: string;
  created_at: string;
  updated_at: string;
}

export interface ReservationInput {
  arrival_date: string;
  arrival_block: BlockType;
  departure_date: string;
  departure_block: BlockType;
  adults: number;
  children: number;
  client: ClientInput;
  estimated_amount: number;
}

// ============================================
// DISPONIBILIDAD
// ============================================
export interface DateAvailability {
  date: string; // YYYY-MM-DD
  morning_available: boolean;
  night_available: boolean;
  reservation_id?: number; // Si está ocupado, ID de la reserva
}

export interface AvailabilityRange {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
  dates: DateAvailability[];
}

// ============================================
// PARÁMETROS DEL SISTEMA
// ============================================
export interface SystemParameters {
  adult_price_per_day: number;
  child_price_per_day: number;
  min_adults: number;
  max_total_people: number;
  min_nights: number;
  buffer_half_day: boolean;
  timezone: string;
}

// ============================================
// CÁLCULO DE PRECIOS
// ============================================
export interface PriceBreakdown {
  adults: number;
  children: number;
  full_days: number;
  half_days: number;
  adult_subtotal: number;
  child_subtotal: number;
  total: number;
}

// ============================================
// VALIDACIONES
// ============================================
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// ============================================
// API RESPONSE (JSON:API Standard)
// ============================================
export interface ApiMeta {
  page?: number;
  per_page?: number;
  total?: number;
  last_page?: number;
}

export interface ApiLinks {
  first?: string;
  last?: string;
  prev?: string | null;
  next?: string | null;
}

export interface ApiResponse<T> {
  data: T;
  meta?: ApiMeta;
  links?: ApiLinks;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

// ============================================
// FORMULARIO MULTI-STEP
// ============================================
export type FormStep = 'dates' | 'guests' | 'contact' | 'confirmation';

export interface ReservationFormData {
  // Step 1: Dates
  arrival_date?: string;
  arrival_block?: BlockType;
  departure_date?: string;
  departure_block?: BlockType;

  // Step 2: Guests
  adults?: number;
  children?: number;

  // Step 3: Contact
  client_name?: string;
  client_whatsapp?: string;
  client_email?: string;
  client_city?: string;
  client_observations?: string;

  // Calculated
  estimated_amount?: number;
}
