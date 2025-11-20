/**
 * BOOKING REVIEW COMPONENT
 *
 * Final review step before submitting the booking.
 * Step 3 of the booking wizard.
 *
 * Displays:
 * - Selected dates and nights
 * - Guest information
 * - Special requests
 * - Terms and conditions acceptance
 */

import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, User, Mail, Phone, Users, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import type { BookingFormData } from './BookingForm';

interface BookingReviewProps {
  dates: {
    from: Date;
    to: Date;
  };
  formData: BookingFormData;
  onSubmit: () => void;
  onBack: () => void;
  onEditDates: () => void;
  onEditInfo: () => void;
  isSubmitting?: boolean;
}

export default function BookingReview({
  dates,
  formData,
  onSubmit,
  onBack,
  onEditDates,
  onEditInfo,
  isSubmitting = false,
}: BookingReviewProps) {
  const [acceptTerms, setAcceptTerms] = useState(false);

  const nights = differenceInDays(dates.to, dates.from);
  const checkIn = format(dates.from, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  const checkOut = format(dates.to, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });

  const handleSubmit = () => {
    if (!acceptTerms) {
      alert('Debes aceptar los términos y condiciones para continuar');
      return;
    }
    onSubmit();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Revisa tu Reserva</h2>
        <p className="text-muted-foreground">
          Por favor verifica que toda la información sea correcta antes de confirmar.
        </p>
      </div>

      {/* Dates Section */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Calendar className="h-5 w-5 text-primary" />
            Fechas de Estadía
          </h3>
          <Button variant="ghost" size="sm" onClick={onEditDates}>
            Editar
          </Button>
        </div>

        <div className="space-y-3">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Check-in</p>
              <p className="mt-1 text-base font-medium capitalize">{checkIn}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Check-out</p>
              <p className="mt-1 text-base font-medium capitalize">{checkOut}</p>
            </div>
          </div>

          <div className="rounded-md bg-muted/50 p-3">
            <p className="text-sm font-medium">
              Total: <span className="text-primary">{nights} noche{nights !== 1 ? 's' : ''}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Guest Information Section */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <User className="h-5 w-5 text-primary" />
            Información del Huésped
          </h3>
          <Button variant="ghost" size="sm" onClick={onEditInfo}>
            Editar
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nombre</p>
              <p className="mt-0.5 text-base">{formData.fullName}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="mt-0.5 text-base">{formData.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
              <p className="mt-0.5 text-base">{formData.phone}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Users className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Número de Huéspedes</p>
              <p className="mt-0.5 text-base">
                {formData.guestCount} persona{formData.guestCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {formData.specialRequests && (
            <div className="flex items-start gap-3">
              <MessageSquare className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Solicitudes Especiales</p>
                <p className="mt-0.5 text-base">{formData.specialRequests}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <input
            id="terms"
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
          />
          <div className="flex-1">
            <Label htmlFor="terms" className="cursor-pointer text-sm">
              Acepto los{' '}
              <a href="#" className="font-medium text-primary underline hover:no-underline">
                términos y condiciones
              </a>{' '}
              y la{' '}
              <a href="#" className="font-medium text-primary underline hover:no-underline">
                política de privacidad
              </a>{' '}
              de Quinta de Colliguay.
            </Label>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h4 className="mb-2 font-semibold text-blue-900">Información Importante</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Recibirás un email de confirmación a {formData.email}</li>
          <li>• El check-in es a partir de las 15:00 hrs</li>
          <li>• El check-out es hasta las 12:00 hrs</li>
          <li>• La reserva está sujeta a disponibilidad y confirmación</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting} className="flex-1">
          Volver
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!acceptTerms || isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Procesando...' : 'Confirmar Reserva'}
        </Button>
      </div>
    </div>
  );
}
