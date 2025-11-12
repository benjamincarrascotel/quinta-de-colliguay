// ============================================
// CONSTANTES DEL SISTEMA
// ============================================

export const TIMEZONE = 'America/Santiago';

// Valores por defecto (pueden ser sobrescritos por la API)
export const DEFAULT_PARAMETERS = {
  ADULT_PRICE_PER_DAY: 20000,
  CHILD_PRICE_PER_DAY: 10000,
  MIN_ADULTS: 20,
  MAX_TOTAL_PEOPLE: 60,
  MIN_NIGHTS: 2,
  MAX_CHILD_AGE: 10,
};

// Ciudades de Chile (principales)
export const CHILEAN_CITIES = [
  'Arica',
  'Iquique',
  'Antofagasta',
  'Copiapó',
  'La Serena',
  'Coquimbo',
  'Valparaíso',
  'Viña del Mar',
  'Santiago',
  'Rancagua',
  'Talca',
  'Concepción',
  'Temuco',
  'Valdivia',
  'Puerto Montt',
  'Coyhaique',
  'Punta Arenas',
  'Otra',
];

// Mensajes de validación
export const VALIDATION_MESSAGES = {
  MIN_ADULTS: `Se requiere un mínimo de ${DEFAULT_PARAMETERS.MIN_ADULTS} adultos`,
  MAX_PEOPLE: `El máximo total es ${DEFAULT_PARAMETERS.MAX_TOTAL_PEOPLE} personas (adultos + niños)`,
  MIN_NIGHTS: `La estancia mínima es de ${DEFAULT_PARAMETERS.MIN_NIGHTS} noches`,
  REQUIRED_FIELD: 'Este campo es obligatorio',
  INVALID_EMAIL: 'El email no es válido',
  INVALID_PHONE: 'El teléfono debe tener 9 dígitos',
  DATE_OVERLAP: 'Las fechas seleccionadas no están disponibles',
  INVALID_DATE_RANGE: 'La fecha de salida debe ser posterior a la de llegada',
};

// Mensajes de información
export const INFO_MESSAGES = {
  CAPACITY_TITLE: 'Requisitos de Capacidad',
  CAPACITY_DESC: `Mínimo ${DEFAULT_PARAMETERS.MIN_ADULTS} adultos, máximo ${DEFAULT_PARAMETERS.MAX_TOTAL_PEOPLE} personas total`,
  MIN_STAY_TITLE: 'Estancia Mínima',
  MIN_STAY_DESC: `${DEFAULT_PARAMETERS.MIN_NIGHTS} noches mínimas`,
  CHILDREN_AGE: `Niños: hasta ${DEFAULT_PARAMETERS.MAX_CHILD_AGE} años`,
  CANCELLATION_TITLE: 'Política de Cancelación',
  CANCELLATION_DESC: '≥7 días: reembolsable. <7 días: no reembolsable',
  DEPOSIT_REQUIRED: 'Se requiere anticipo para confirmar la reserva',
};

// Estados de la reserva
export const STATUS_LABELS = {
  requested: 'Solicitado',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
};

export const STATUS_COLORS = {
  requested: 'bg-water-100 text-water-700 border-water-200',
  confirmed: 'bg-forest-100 text-forest-700 border-forest-200',
  cancelled: 'bg-earth-200 text-earth-700 border-earth-300',
};

// API endpoints
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const API_ENDPOINTS = {
  // Público
  AVAILABILITY: `${API_BASE_URL}/availability`,
  CREATE_REQUEST: `${API_BASE_URL}/requests`,
  PARAMETERS: `${API_BASE_URL}/parameters`,

  // Admin
  REQUESTS_LIST: `${API_BASE_URL}/admin/requests`,
  REQUEST_DETAIL: (id: number) => `${API_BASE_URL}/admin/requests/${id}`,
  CONFIRM_REQUEST: (id: number) => `${API_BASE_URL}/admin/requests/${id}/confirm`,
  CANCEL_REQUEST: (id: number) => `${API_BASE_URL}/admin/requests/${id}/cancel`,
  UPDATE_REQUEST: (id: number) => `${API_BASE_URL}/admin/requests/${id}`,
};

// Configuración de calendario
export const CALENDAR_CONFIG = {
  LOCALE: 'es',
  FIRST_DAY: 1, // Lunes
  MIN_DATE: new Date(), // Hoy
  MAX_DATE: new Date(new Date().setMonth(new Date().getMonth() + 12)), // +12 meses
};
