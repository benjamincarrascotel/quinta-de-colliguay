/**
 * CALENDAR COMPONENT - QUINTA DE COLLIGUAY
 *
 * Full-featured availability calendar using FullCalendar v6.
 *
 * ARCHITECTURE:
 * This component uses a hybrid approach combining direct DOM manipulation
 * and background events for optimal performance and control:
 *
 * 1. dayCellClassNames (CSS classes for specific states):
 *    - calendar-past: Gives past days a subtle gray background
 *
 * 2. dayCellDidMount (Direct DOM styling for colors):
 *    - Today: Yellow background (#fef9c3)
 *    - Availability (future): White/amber/red based on availability data
 *
 * 3. Background Events (Selection UI state only):
 *    - Selection: Green colors showing user's selected date range
 *
 * COLOR PRIORITY:
 * - Base: White background (default)
 * - dayCellClassNames: Past days gray
 * - dayCellDidMount: Today yellow, availability colors
 * - Background Events: Selection green (highest priority, rendered last)
 *
 * VALIDATION:
 * - Visual: All days visible, no disabled appearance
 * - Business logic: selectAllow prevents past date selection
 * - Minimum 2 nights enforced in date click/select handlers
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { DateSelectArg, EventContentArg, DatesSetArg } from '@fullcalendar/core';
import esLocale from '@fullcalendar/core/locales/es';
import { startOfMonth, endOfMonth, addMonths, format, parseISO, differenceInDays, addDays } from 'date-fns';
import { useAvailabilityStore } from '@/stores/availabilityStore';
import './Calendar.css';

interface CalendarProps {
  onDateSelect?: (start: Date, end: Date) => void;
  selectable?: boolean;
  adminView?: boolean;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  display: 'background';
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  classNames?: string[];
  extendedProps: {
    morning_available?: boolean;
    night_available?: boolean;
    type: 'selection';
    selectionType: 'start' | 'selected' | 'hover';
  };
}

const Calendar = ({ onDateSelect, selectable = true, adminView = false }: CalendarProps) => {
  const calendarRef = useRef<FullCalendar>(null);
  const { availability, fetchAvailability, setDateRange, selectedRange, isLoading } = useAvailabilityStore();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentRange, setCurrentRange] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(addMonths(new Date(), 1)),
  });
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  // Fetch availability when date range changes
  useEffect(() => {
    fetchAvailability(currentRange.start, currentRange.end);
  }, [currentRange, fetchAvailability]);

  // Add mouse event listeners to calendar day cells using event delegation
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!selectedRange.from || selectedRange.to) {
        setHoverDate(null);
        return;
      }

      const target = e.target as HTMLElement;
      const dayCell = target.closest('[data-datestr]');

      if (dayCell) {
        const dateStr = dayCell.getAttribute('data-datestr');
        if (dateStr) {
          try {
            setHoverDate(parseISO(dateStr));
          } catch (error) {
            // Silently handle date parsing errors
          }
        }
      }
    };

    const handleMouseLeave = () => {
      setHoverDate(null);
    };

    const calendarElement = document.querySelector('.fc') as HTMLElement;
    if (calendarElement) {
      calendarElement.addEventListener('mousemove', handleMouseMove);
      calendarElement.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        calendarElement.removeEventListener('mousemove', handleMouseMove);
        calendarElement.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [selectedRange.from, selectedRange.to]);

  // Convert selection data to FullCalendar events
  // ARCHITECTURE: Using background events ONLY for selection (green colors)
  // All other colors (today, availability) are handled via dayCellDidMount
  useEffect(() => {
    // SELECTION EVENTS (UI state)
    // These show the user's current selection: green in various shades
    const selectionEvents: CalendarEvent[] = [];

    if (selectedRange.from) {
      const fromStr = format(selectedRange.from, 'yyyy-MM-dd');

      // Create selection range dates
      let datesToHighlight: { date: string; type: 'start' | 'selected' | 'hover' }[] = [];

      if (selectedRange.to) {
        // Complete selection: from → to
        const toStr = format(selectedRange.to, 'yyyy-MM-dd');
        availability.forEach((dateAvail) => {
          if (fromStr <= dateAvail.date && dateAvail.date <= toStr) {
            if (dateAvail.date === fromStr) {
              datesToHighlight.push({ date: dateAvail.date, type: 'start' });
            } else {
              datesToHighlight.push({ date: dateAvail.date, type: 'selected' });
            }
          }
        });
      } else if (hoverDate) {
        // Hover preview: from → hover
        const hoverStr = format(hoverDate, 'yyyy-MM-dd');
        availability.forEach((dateAvail) => {
          if (fromStr <= dateAvail.date && dateAvail.date <= hoverStr) {
            datesToHighlight.push({ date: dateAvail.date, type: 'hover' });
          }
        });
      }

      // Create selection events
      datesToHighlight.forEach((item) => {
        let backgroundColor, borderColor, textColor, title;

        if (item.type === 'selected') {
          backgroundColor = '#22c55e'; // green-500 (selected range)
          borderColor = '#16a34a'; // green-600
          textColor = '#ffffff'; // white text
          title = 'Seleccionado';
        } else if (item.type === 'start') {
          backgroundColor = '#4ade80'; // green-400 (start date)
          borderColor = '#22c55e'; // green-500
          textColor = '#14532d'; // forest-900
          title = 'Fecha de entrada';
        } else { // hover
          backgroundColor = '#d1fae5'; // green-100 (hover preview)
          borderColor = '#86efac'; // green-300
          textColor = '#14532d'; // forest-900
          title = 'Preview';
        }

        selectionEvents.push({
          id: `selection-${item.date}`,
          title,
          start: item.date,
          display: 'background',
          backgroundColor,
          borderColor,
          textColor,
          classNames: [`event-selection-${item.type}`],
          extendedProps: {
            type: 'selection',
            selectionType: item.type,
          },
        });
      });
    }

    // Set only selection events (availability colors handled by dayCellDidMount)
    setEvents(selectionEvents);
  }, [selectedRange.from, selectedRange.to, hoverDate, availability]);

  // Handle month change
  const handleDatesSet = useCallback((arg: DatesSetArg) => {
    const start = startOfMonth(arg.start);
    const end = endOfMonth(addMonths(arg.start, 1));

    // Only update if the range actually changed to prevent infinite loop
    setCurrentRange((prev) => {
      if (prev.start.getTime() === start.getTime() && prev.end.getTime() === end.getTime()) {
        return prev;
      }
      return { start, end };
    });
  }, []);

  // Handle date click (single date selection)
  const handleDateClick = useCallback((arg: DateClickArg) => {
    if (!selectable) return;

    const clickedDate = parseISO(arg.dateStr);

    // If no start date selected, or if we already have a complete range, start new selection
    if (!selectedRange.from || (selectedRange.from && selectedRange.to)) {
      setDateRange(clickedDate, null);
    } else {
      // We have a start date, now we're clicking the end date
      let start = selectedRange.from;
      let end = clickedDate;

      // If clicked date is before the start date, swap them
      // This handles the case where user clicks backwards
      if (clickedDate < selectedRange.from) {
        start = clickedDate;
        end = selectedRange.from;
      }

      // Check minimum nights (2)
      const nights = differenceInDays(end, start);
      if (nights < 2) {
        alert('La reserva debe ser de mínimo 2 noches. Por favor selecciona un rango de al menos 2 días.');
        // Reset selection and start fresh with the clicked date
        setDateRange(clickedDate, null);
        return;
      }

      // Set the complete range
      setDateRange(start, end);

      if (onDateSelect) {
        onDateSelect(start, end);
      }
    }
  }, [selectedRange, setDateRange, onDateSelect, selectable]);

  // Handle date range selection (drag)
  const handleSelect = useCallback((arg: DateSelectArg) => {
    if (!selectable) return;

    const start = arg.start;
    const end = addDays(arg.end, -1); // FullCalendar end is exclusive

    // Check minimum nights (2)
    const nights = differenceInDays(end, start);
    if (nights < 2) {
      alert('La reserva debe ser de mínimo 2 noches');
      return;
    }

    setDateRange(start, end);

    if (onDateSelect) {
      onDateSelect(start, end);
    }
  }, [setDateRange, onDateSelect, selectable]);

  // Custom event content - renders title for selection events
  const renderEventContent = (eventInfo: EventContentArg) => {
    const { morning_available, night_available, selectionType } = eventInfo.event.extendedProps;

    return (
      <div className="p-1 text-xs" data-selection-type={selectionType}>
        <div className="font-semibold">{eventInfo.event.title}</div>
        {!adminView && (morning_available !== undefined || night_available !== undefined) && (
          <div className="mt-0.5 text-[10px]">
            {morning_available && night_available && '🌅 🌙'}
            {morning_available && !night_available && '🌅'}
            {!morning_available && night_available && '🌙'}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-4">
        {/* Selected Range Info */}
        {selectedRange.from && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm font-medium text-green-800">
              {selectedRange.to ? (
                <>
                  Rango seleccionado: <strong>{format(selectedRange.from, 'dd/MM/yyyy')}</strong>
                  {' → '}
                  <strong>{format(selectedRange.to, 'dd/MM/yyyy')}</strong>
                  {' '}
                  ({differenceInDays(selectedRange.to, selectedRange.from)} noches)
                </>
              ) : (
                <>
                  Fecha de entrada: <strong>{format(selectedRange.from, 'dd/MM/yyyy')}</strong>
                  {' '}(selecciona la fecha de salida)
                </>
              )}
            </p>
          </div>
        )}

        {/* Legend */}
        <div className="mb-4 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-white border border-gray-200"></div>
            <span>Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-100 border border-amber-300"></div>
            <span>Parcialmente disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-200 border border-red-300"></div>
            <span>No disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-400 border border-green-500"></div>
            <span>Seleccionado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 border border-green-300"></div>
            <span>Preview</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🌅 Mañana</span>
            <span>🌙 Noche</span>
          </div>
        </div>

        {/* FullCalendar */}
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={esLocale}
          firstDay={1} // Monday
          height="auto"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: '',
          }}
          buttonText={{
            today: 'Hoy',
          }}
          events={events}
          selectable={false}
          selectMirror={false}
          dayMaxEvents={true}
          weekends={true}
          dateClick={handleDateClick}
          select={handleSelect}
          datesSet={handleDatesSet}
          eventContent={renderEventContent}
          dayCellClassNames={(arg) => {
            // Apply gray background to past days (today handled by dayCellDidMount)
            if (arg.isPast && !arg.isToday) {
              return ['calendar-past'];
            }
            return [];
          }}
          dayCellDidMount={(arg) => {
            const dateStr = format(arg.date, 'yyyy-MM-dd');
            const today = format(new Date(), 'yyyy-MM-dd');

            // Apply yellow background to today's date
            if (dateStr === today) {
              arg.el.style.backgroundColor = '#fef9c3'; // yellow-100
            }

            // FUTURE: Add availability colors here
            // const availData = availability.find(a => a.date === dateStr);
            // if (availData && dateStr !== today) {
            //   if (!availData.morning_available && !availData.night_available) {
            //     arg.el.style.backgroundColor = '#fecaca'; // red-200 (unavailable)
            //   } else if (!availData.morning_available || !availData.night_available) {
            //     arg.el.style.backgroundColor = '#fef3c7'; // amber-100 (partial)
            //   }
            // }
          }}
          selectAllow={(selectInfo) => {
            // Only allow future dates
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return selectInfo.start >= today;
          }}
        />
      </div>
    </div>
  );
};

export default Calendar;
