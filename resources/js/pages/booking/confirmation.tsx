/**
 * BOOKING CONFIRMATION PAGE
 *
 * Displays successful booking confirmation with details.
 * User is redirected here after completing the booking wizard.
 */

import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle, Calendar, Mail, Home } from 'lucide-react';
import { Link } from '@inertiajs/react';
import BookingLayout from '@/layouts/booking-layout';
import { Button } from '@/components/ui/button';

interface BookingConfirmationProps {
  booking: {
    confirmation_code: string;
    check_in: string;
    check_out: string;
    full_name: string;
    email: string;
    phone: string;
    guest_count: number;
    special_requests?: string;
    created_at: string;
  };
}

export default function BookingConfirmation({ booking }: BookingConfirmationProps) {
  const checkIn = new Date(booking.check_in);
  const checkOut = new Date(booking.check_out);
  const nights = differenceInDays(checkOut, checkIn);

  const checkInFormatted = format(checkIn, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  const checkOutFormatted = format(checkOut, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });

  return (
    <BookingLayout>
      <div className="mx-auto max-w-3xl">
        {/* Success Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-green-900 md:text-4xl">
            ¡Reserva Confirmada!
          </h1>
          <p className="text-lg text-muted-foreground">
            Tu solicitud de reserva ha sido enviada exitosamente
          </p>
        </div>

        {/* Confirmation Code */}
        <div className="mb-6 rounded-lg border-2 border-green-200 bg-green-50 p-6 text-center">
          <p className="mb-2 text-sm font-medium text-green-900">Código de Confirmación</p>
          <p className="text-2xl font-bold tracking-wider text-green-700">
            {booking.confirmation_code}
          </p>
          <p className="mt-2 text-sm text-green-800">
            Guarda este código para futuras referencias
          </p>
        </div>

        {/* Booking Details */}
        <div className="mb-6 rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Detalles de tu Reserva</h2>

          <div className="space-y-4">
            {/* Dates */}
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Fechas de Estadía
              </div>
              <div className="ml-6 space-y-1">
                <p className="text-base">
                  <span className="font-medium">Check-in:</span>{' '}
                  <span className="capitalize">{checkInFormatted}</span> (15:00 hrs)
                </p>
                <p className="text-base">
                  <span className="font-medium">Check-out:</span>{' '}
                  <span className="capitalize">{checkOutFormatted}</span> (12:00 hrs)
                </p>
                <p className="text-sm text-muted-foreground">
                  Total: {nights} noche{nights !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="mb-2 text-sm font-medium text-muted-foreground">Huésped Principal</div>
              <div className="ml-6 space-y-1">
                <p className="text-base">{booking.full_name}</p>
                <p className="text-sm text-muted-foreground">{booking.email}</p>
                <p className="text-sm text-muted-foreground">{booking.phone}</p>
                <p className="text-sm text-muted-foreground">
                  {booking.guest_count} persona{booking.guest_count !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {booking.special_requests && (
              <div className="border-t pt-4">
                <div className="mb-2 text-sm font-medium text-muted-foreground">
                  Solicitudes Especiales
                </div>
                <div className="ml-6">
                  <p className="text-base">{booking.special_requests}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Next Steps */}
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-blue-900">
            <Mail className="h-5 w-5" />
            Próximos Pasos
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>
                Hemos enviado un email de confirmación a <strong>{booking.email}</strong> con todos los
                detalles de tu reserva.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>
                Nuestro equipo revisará tu solicitud y se pondrá en contacto contigo dentro de las próximas
                24 horas para confirmar la disponibilidad.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>Recibirás instrucciones de pago y detalles adicionales por email.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>
                Si tienes alguna pregunta, no dudes en contactarnos respondiendo al email de confirmación.
              </span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="outline" className="flex-1">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Volver al Inicio
            </Link>
          </Button>
          <Button asChild className="flex-1">
            <a href={`mailto:info@quintadecolliguay.cl?subject=Consulta sobre reserva ${booking.confirmation_code}`}>
              <Mail className="mr-2 h-4 w-4" />
              Contactar
            </a>
          </Button>
        </div>

        {/* Print Button */}
        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.print()}
            className="text-muted-foreground"
          >
            Imprimir Confirmación
          </Button>
        </div>
      </div>
    </BookingLayout>
  );
}
