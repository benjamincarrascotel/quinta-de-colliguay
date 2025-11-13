import { apiClient } from './api';
import type {
  Reservation,
  ReservationInput,
  AvailabilityRange,
  SystemParameters,
  ApiResponse,
} from '@/types/index';
import { API_ENDPOINTS } from '@utils/constants';

// ============================================
// RESERVATION SERVICE - Servicio abstracto de reservas
// ============================================

export const reservationService = {
  /**
   * Obtiene la disponibilidad del calendario en un rango de fechas
   */
  async getAvailability(from: string, to: string): Promise<AvailabilityRange> {
    const response = await apiClient.get<AvailabilityRange>(API_ENDPOINTS.AVAILABILITY, {
      params: { from, to },
    });
    return response.data;
  },

  /**
   * Crea una nueva solicitud de reserva
   */
  async createRequest(data: ReservationInput): Promise<Reservation> {
    const response = await apiClient.post<Reservation>(API_ENDPOINTS.CREATE_REQUEST, data);
    return response.data;
  },

  /**
   * Obtiene los parámetros del sistema (precios, límites, etc.)
   */
  async getParameters(): Promise<SystemParameters> {
    const response = await apiClient.get<SystemParameters>(API_ENDPOINTS.PARAMETERS);
    return response.data;
  },

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================

  /**
   * Lista todas las solicitudes (con paginación y filtros)
   */
  async listRequests(params?: {
    status?: string;
    page?: number;
    per_page?: number;
    from_date?: string;
    to_date?: string;
  }): Promise<ApiResponse<Reservation[]>> {
    return apiClient.get<Reservation[]>(API_ENDPOINTS.REQUESTS_LIST, { params });
  },

  /**
   * Obtiene el detalle de una solicitud
   */
  async getRequestDetail(id: number): Promise<Reservation> {
    const response = await apiClient.get<Reservation>(API_ENDPOINTS.REQUEST_DETAIL(id));
    return response.data;
  },

  /**
   * Actualiza una solicitud
   */
  async updateRequest(id: number, data: Partial<ReservationInput>): Promise<Reservation> {
    const response = await apiClient.patch<Reservation>(API_ENDPOINTS.UPDATE_REQUEST(id), data);
    return response.data;
  },

  /**
   * Confirma una solicitud (requiere datos de anticipo)
   */
  async confirmRequest(
    id: number,
    depositData: {
      deposit_amount: number;
      deposit_date: string;
      deposit_method?: string;
      deposit_reference?: string;
    }
  ): Promise<Reservation> {
    const response = await apiClient.post<Reservation>(
      API_ENDPOINTS.CONFIRM_REQUEST(id),
      depositData
    );
    return response.data;
  },

  /**
   * Cancela una solicitud
   */
  async cancelRequest(
    id: number,
    reason: string
  ): Promise<Reservation> {
    const response = await apiClient.post<Reservation>(API_ENDPOINTS.CANCEL_REQUEST(id), {
      reason,
    });
    return response.data;
  },

  /**
   * Descarga el archivo .ics de una reserva confirmada
   */
  async downloadCalendarEvent(id: number): Promise<void> {
    await apiClient.downloadFile(
      `${API_ENDPOINTS.REQUEST_DETAIL(id)}/calendar`,
      `reserva-${id}.ics`
    );
  },
};
