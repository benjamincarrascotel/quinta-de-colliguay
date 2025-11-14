import { useEffect, useRef, useState, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { DateSelectArg, EventContentArg, DatesSetArg } from '@fullcalendar/core';
import esLocale from '@fullcalendar/core/locales/es';
import { startOfMonth, endOfMonth, addMonths, format, parseISO, differenceInDays, addDays } from 'date-fns';
import { useAvailabilityStore } from '../../stores/availabilityStore';
import { Spinner } from '../atoms/Spinner';
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
  end?: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps?: {
    morning_available?: boolean;
    night_available?: boolean;
    type?: 'availability' | 'reservation';
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

  // Fetch availability when date range changes
  useEffect(() => {
    fetchAvailability(currentRange.start, currentRange.end);
  }, [currentRange, fetchAvailability]);

  // Convert availability data to FullCalendar events
  useEffect(() => {
    const calendarEvents: CalendarEvent[] = availability.map((dateAvail) => {
      const isFullyAvailable = dateAvail.morning_available && dateAvail.night_available;
      const isPartiallyAvailable = dateAvail.morning_available || dateAvail.night_available;
      const isUnavailable = !dateAvail.morning_available && !dateAvail.night_available;

      let backgroundColor = '#10b981'; // green-500 (available)
      let borderColor = '#059669'; // green-600
      let title = 'Disponible';

      if (isUnavailable) {
        backgroundColor = '#ef4444'; // red-500
        borderColor = '#dc2626'; // red-600
        title = 'No disponible';
      } else if (!isFullyAvailable && isPartiallyAvailable) {
        backgroundColor = '#f59e0b'; // amber-500
        borderColor = '#d97706'; // amber-600
        title = 'Parcialmente disponible';
      }

      return {
        id: `avail-${dateAvail.date}`,
        title,
        start: dateAvail.date,
        backgroundColor,
        borderColor,
        textColor: '#ffffff',
        extendedProps: {
          morning_available: dateAvail.morning_available,
          night_available: dateAvail.night_available,
          type: 'availability',
        },
      };
    });

    setEvents(calendarEvents);
  }, [availability]);

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

    // If no start date selected, or if we already have a range, start new selection
    if (!selectedRange.from || (selectedRange.from && selectedRange.to)) {
      setDateRange(clickedDate, null);
    } else {
      // We have a start date, set the end date
      const start = selectedRange.from < clickedDate ? selectedRange.from : clickedDate;
      const end = selectedRange.from < clickedDate ? clickedDate : selectedRange.from;

      // Check minimum nights (2)
      const nights = differenceInDays(end, start);
      if (nights < 2) {
        alert('La reserva debe ser de mínimo 2 noches');
        setDateRange(clickedDate, null);
        return;
      }

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

  // Custom event content
  const renderEventContent = (eventInfo: EventContentArg) => {
    const { morning_available, night_available } = eventInfo.event.extendedProps;

    return (
      <div className="p-1 text-xs">
        <div className="font-semibold">{eventInfo.event.title}</div>
        {!adminView && (
          <div className="mt-0.5 text-[10px] opacity-90">
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
          <Spinner size="lg" />
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-4">
        {/* Selected Range Info */}
        {selectedRange.from && (
          <div className="mb-4 p-3 bg-forest-50 rounded-lg border border-forest-200">
            <p className="text-sm font-medium text-forest-800">
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
            <div className="w-4 h-4 rounded bg-green-500 border border-green-600"></div>
            <span>Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-500 border border-amber-600"></div>
            <span>Parcialmente disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500 border border-red-600"></div>
            <span>No disponible</span>
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
          selectable={selectable}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          dateClick={handleDateClick}
          select={handleSelect}
          datesSet={handleDatesSet}
          eventContent={renderEventContent}
          selectAllow={(selectInfo) => {
            // Only allow future dates
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return selectInfo.start >= today;
          }}
          validRange={{
            start: new Date(),
          }}
        />
      </div>
    </div>
  );
};

export default Calendar;
