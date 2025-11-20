import { addDays, format, startOfDay } from 'date-fns';
import { create } from 'zustand';

export interface AvailabilityData {
  date: string; // formato YYYY-MM-DD
  morning_available: boolean;
  night_available: boolean;
}

export interface SelectedRange {
  from: Date | null;
  to: Date | null;
}

interface AvailabilityStore {
  availability: AvailabilityData[];
  selectedRange: SelectedRange;
  isLoading: boolean;
  fetchAvailability: (start: Date, end: Date) => Promise<void>;
  setDateRange: (from: Date | null, to: Date | null) => void;
  clearSelection: () => void;
}

/**
 * Generate mock availability data for testing
 * Creates a pattern with ~70% fully available, ~20% partially available, ~10% unavailable
 */
const generateMockAvailability = (
  start: Date,
  end: Date,
): AvailabilityData[] => {
  const days: AvailabilityData[] = [];
  let current = new Date(startOfDay(start));
  const endDate = startOfDay(end);

  while (current <= endDate) {
    // Use date as seed for consistent random pattern
    const seed =
      current.getFullYear() * 10000 +
      (current.getMonth() + 1) * 100 +
      current.getDate();
    const pseudoRandom = (Math.sin(seed) + 1) / 2; // Deterministic "random" 0-1

    // Generate availability pattern
    // ~70% fully available
    // ~20% partially available (morning OR night)
    // ~10% completely unavailable
    let morning_available = true;
    let night_available = true;

    if (pseudoRandom < 0.1) {
      // 10% unavailable
      morning_available = false;
      night_available = false;
    } else if (pseudoRandom < 0.3) {
      // 20% partial
      // Use different seed for morning vs night
      const partialSeed = seed * 7;
      const partialRandom = (Math.sin(partialSeed) + 1) / 2;
      if (partialRandom < 0.5) {
        morning_available = false; // Only night available
      } else {
        night_available = false; // Only morning available
      }
    }
    // else: 70% fully available (both true)

    days.push({
      date: format(current, 'yyyy-MM-dd'),
      morning_available,
      night_available,
    });

    current = addDays(current, 1);
  }

  return days;
};

/**
 * Zustand store for managing booking availability and date selection
 *
 * Features:
 * - Fetch availability data (currently mock, ready for API integration)
 * - Manage selected date range for booking
 * - Loading states
 */
export const useAvailabilityStore = create<AvailabilityStore>((set) => ({
  availability: [],
  selectedRange: { from: null, to: null },
  isLoading: false,

  /**
   * Fetch availability data for date range
   * Currently uses mock data, ready to swap with real API call
   *
   * TODO: Replace mock data with real API
   * Example:
   * ```
   * const response = await axios.get('/api/booking/availability', {
   *   params: {
   *     start: format(start, 'yyyy-MM-dd'),
   *     end: format(end, 'yyyy-MM-dd')
   *   }
   * });
   * set({ availability: response.data, isLoading: false });
   * ```
   */
  fetchAvailability: async (start, end) => {
    set({ isLoading: true });

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Generate mock data
      const mockData = generateMockAvailability(start, end);

      set({ availability: mockData, isLoading: false });
    } catch (error) {
      console.error('Error fetching availability:', error);
      set({ isLoading: false });
    }
  },

  /**
   * Set the selected date range for booking
   */
  setDateRange: (from, to) => {
    set({ selectedRange: { from, to } });
  },

  /**
   * Clear the selected date range
   */
  clearSelection: () => {
    set({ selectedRange: { from: null, to: null } });
  },
}));
