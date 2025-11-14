import { create } from 'zustand';
import { DateAvailability, AvailabilityRange } from '../types';
import { format } from 'date-fns';

interface DateRange {
  from: Date | null;
  to: Date | null;
}

interface SelectedBlocks {
  arrivalBlock: 'morning' | 'night';
  departureBlock: 'morning' | 'night';
}

interface AvailabilityState {
  availability: DateAvailability[];
  selectedRange: DateRange;
  selectedBlocks: SelectedBlocks;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAvailability: (from: Date, to: Date) => Promise<void>;
  setDateRange: (from: Date | null, to: Date | null) => void;
  setBlocks: (blocks: SelectedBlocks) => void;
  clearSelection: () => void;
  isDateAvailable: (date: Date, block?: 'morning' | 'night') => boolean;
  clearError: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const useAvailabilityStore = create<AvailabilityState>((set, get) => ({
  availability: [],
  selectedRange: {
    from: null,
    to: null,
  },
  selectedBlocks: {
    arrivalBlock: 'night',
    departureBlock: 'morning',
  },
  isLoading: false,
  error: null,

  fetchAvailability: async (from: Date, to: Date) => {
    set({ isLoading: true, error: null });

    try {
      const fromStr = format(from, 'yyyy-MM-dd');
      const toStr = format(to, 'yyyy-MM-dd');

      const response = await fetch(
        `${API_BASE_URL}/availability?from=${fromStr}&to=${toStr}`
      );

      if (!response.ok) {
        throw new Error('Error al obtener disponibilidad');
      }

      const data: AvailabilityRange = await response.json();

      set({
        availability: data.dates,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al obtener disponibilidad';
      set({ error: errorMessage, isLoading: false });
    }
  },

  setDateRange: (from: Date | null, to: Date | null) => {
    set({
      selectedRange: { from, to },
    });
  },

  setBlocks: (blocks: SelectedBlocks) => {
    set({ selectedBlocks: blocks });
  },

  clearSelection: () => {
    set({
      selectedRange: { from: null, to: null },
      selectedBlocks: { arrivalBlock: 'night', departureBlock: 'morning' },
    });
  },

  isDateAvailable: (date: Date, block?: 'morning' | 'night') => {
    const { availability } = get();
    const dateStr = format(date, 'yyyy-MM-dd');

    const dateAvailability = availability.find(a => a.date === dateStr);

    if (!dateAvailability) {
      return false;
    }

    if (block) {
      return dateAvailability[`${block}Available`] as boolean;
    }

    // If no block specified, check if any block is available
    return dateAvailability.morning_available || dateAvailability.night_available;
  },

  clearError: () => {
    set({ error: null });
  },
}));
