import { create } from 'zustand';
import { Reservation, ReservationInput, ApiResponse } from '../types';

interface ReservationFilters {
  status?: 'requested' | 'confirmed' | 'cancelled';
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  last_page: number;
}

interface ReservationState {
  reservations: Reservation[];
  currentReservation: Reservation | null;
  filters: ReservationFilters;
  pagination: PaginationMeta;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchReservations: (page?: number, limit?: number) => Promise<void>;
  fetchReservationById: (id: number) => Promise<void>;
  createReservation: (data: ReservationInput) => Promise<Reservation>;
  updateReservation: (id: number, data: Partial<ReservationInput>) => Promise<void>;
  confirmReservation: (id: number, data: {
    finalAmount: number;
    depositAmount: number;
    depositDate: string;
    depositMethod: string;
    depositReference?: string;
    adminObservations?: string;
  }) => Promise<void>;
  cancelReservation: (id: number, reason: string) => Promise<void>;
  setFilters: (filters: ReservationFilters) => void;
  clearFilters: () => void;
  setCurrentReservation: (reservation: Reservation | null) => void;
  clearError: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const useReservationStore = create<ReservationState>((set, get) => ({
  reservations: [],
  currentReservation: null,
  filters: {},
  pagination: {
    page: 1,
    per_page: 10,
    total: 0,
    last_page: 0,
  },
  isLoading: false,
  error: null,

  fetchReservations: async (page = 1, limit = 10) => {
    set({ isLoading: true, error: null });

    try {
      const { filters } = get();
      const token = localStorage.getItem('auth-storage');
      const authData = token ? JSON.parse(token) : null;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        per_page: limit.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
      });

      const response = await fetch(`${API_BASE_URL}/admin/requests?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${authData?.state?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener reservas');
      }

      const data: ApiResponse<Reservation[]> = await response.json();

      set({
        reservations: data.data,
        pagination: {
          page: data.meta?.page || page,
          per_page: data.meta?.per_page || limit,
          total: data.meta?.total || 0,
          last_page: data.meta?.last_page || 0,
        },
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al obtener reservas';
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchReservationById: async (id: number) => {
    set({ isLoading: true, error: null });

    try {
      const token = localStorage.getItem('auth-storage');
      const authData = token ? JSON.parse(token) : null;

      const response = await fetch(`${API_BASE_URL}/admin/requests/${id}`, {
        headers: {
          'Authorization': `Bearer ${authData?.state?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener la reserva');
      }

      const data: ApiResponse<Reservation> = await response.json();

      set({
        currentReservation: data.data,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al obtener la reserva';
      set({ error: errorMessage, isLoading: false });
    }
  },

  createReservation: async (data: ReservationInput) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${API_BASE_URL}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al crear la reserva');
      }

      const result: ApiResponse<Reservation> = await response.json();

      set({ isLoading: false });

      return result.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear la reserva';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateReservation: async (id: number, data: Partial<ReservationInput>) => {
    set({ isLoading: true, error: null });

    try {
      const token = localStorage.getItem('auth-storage');
      const authData = token ? JSON.parse(token) : null;

      const response = await fetch(`${API_BASE_URL}/admin/requests/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData?.state?.token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al actualizar la reserva');
      }

      const result: ApiResponse<Reservation> = await response.json();

      set({
        currentReservation: result.data,
        isLoading: false,
      });

      // Refresh list if needed
      const { fetchReservations, pagination } = get();
      fetchReservations(pagination.page, pagination.limit);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar la reserva';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  confirmReservation: async (id: number, data) => {
    set({ isLoading: true, error: null });

    try {
      const token = localStorage.getItem('auth-storage');
      const authData = token ? JSON.parse(token) : null;

      const response = await fetch(`${API_BASE_URL}/admin/requests/${id}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData?.state?.token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al confirmar la reserva');
      }

      const result: ApiResponse<Reservation> = await response.json();

      set({
        currentReservation: result.data,
        isLoading: false,
      });

      // Refresh list
      const { fetchReservations, pagination } = get();
      fetchReservations(pagination.page, pagination.limit);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al confirmar la reserva';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  cancelReservation: async (id: number, reason: string) => {
    set({ isLoading: true, error: null });

    try {
      const token = localStorage.getItem('auth-storage');
      const authData = token ? JSON.parse(token) : null;

      const response = await fetch(`${API_BASE_URL}/admin/requests/${id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData?.state?.token}`,
        },
        body: JSON.stringify({ cancellationReason: reason }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al cancelar la reserva');
      }

      const result: ApiResponse<Reservation> = await response.json();

      set({
        currentReservation: result.data,
        isLoading: false,
      });

      // Refresh list
      const { fetchReservations, pagination } = get();
      fetchReservations(pagination.page, pagination.limit);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cancelar la reserva';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  setFilters: (filters: ReservationFilters) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  clearFilters: () => {
    set({ filters: {} });
  },

  setCurrentReservation: (reservation: Reservation | null) => {
    set({ currentReservation: reservation });
  },

  clearError: () => {
    set({ error: null });
  },
}));
