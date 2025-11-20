/**
 * BOOKING WIZARD - MAIN PAGE
 *
 * Three-step booking process:
 * 1. Select Dates (Calendar)
 * 2. Enter Guest Information (Form)
 * 3. Review and Confirm (Review)
 *
 * After successful booking, redirects to confirmation page.
 */

import { useState } from 'react';
import { router } from '@inertiajs/react';
import BookingLayout from '@/layouts/booking-layout';
import Calendar from '@/components/booking/Calendar';
import BookingForm, { type BookingFormData } from '@/components/booking/BookingForm';
import BookingReview from '@/components/booking/BookingReview';
import { useAvailabilityStore } from '@/stores/availabilityStore';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

type BookingStep = 1 | 2 | 3;

export default function BookingIndex() {
  const [currentStep, setCurrentStep] = useState<BookingStep>(1);
  const [formData, setFormData] = useState<BookingFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { selectedRange, clearSelection } = useAvailabilityStore();

  // Step 1: Date selection
  const handleDateSelect = (start: Date, end: Date) => {
    // Dates are already stored in the store
    console.log('Dates selected:', start, end);
  };

  const handleContinueFromDates = () => {
    if (!selectedRange.from || !selectedRange.to) {
      alert('Por favor selecciona las fechas de tu estadía');
      return;
    }
    setCurrentStep(2);
  };

  // Step 2: Form submission
  const handleFormSubmit = (data: BookingFormData) => {
    setFormData(data);
    setCurrentStep(3);
  };

  const handleBackFromForm = () => {
    setCurrentStep(1);
  };

  // Step 3: Final confirmation
  const handleFinalSubmit = async () => {
    if (!selectedRange.from || !selectedRange.to || !formData) {
      alert('Información incompleta');
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit booking to backend
      const bookingData = {
        check_in: selectedRange.from.toISOString().split('T')[0],
        check_out: selectedRange.to.toISOString().split('T')[0],
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        guest_count: formData.guestCount,
        special_requests: formData.specialRequests,
      };

      // Use Inertia to submit and redirect
      router.post('/booking/submit', bookingData, {
        onSuccess: () => {
          // Clear selection after successful booking
          clearSelection();
        },
        onError: (errors) => {
          console.error('Booking submission failed:', errors);
          alert('Hubo un error al procesar tu reserva. Por favor intenta nuevamente.');
          setIsSubmitting(false);
        },
      });
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('Hubo un error al procesar tu reserva. Por favor intenta nuevamente.');
      setIsSubmitting(false);
    }
  };

  const handleBackFromReview = () => {
    setCurrentStep(2);
  };

  const handleEditDates = () => {
    setCurrentStep(1);
  };

  const handleEditInfo = () => {
    setCurrentStep(2);
  };

  return (
    <BookingLayout currentStep={currentStep} totalSteps={3}>
      <div className="mx-auto max-w-4xl">
        {/* Step 1: Select Dates */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Selecciona tus Fechas</h1>
              <p className="text-lg text-muted-foreground">
                Elige las fechas de entrada y salida para tu estadía en Quinta de Colliguay.
              </p>
            </div>

            <Calendar onDateSelect={handleDateSelect} selectable={true} />

            {/* Continue Button */}
            {selectedRange.from && selectedRange.to && (
              <div className="flex justify-end pt-4">
                <Button onClick={handleContinueFromDates} size="lg" className="gap-2">
                  Continuar con la Reserva
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Guest Information */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Información del Huésped</h1>
              <p className="text-lg text-muted-foreground">
                Completa tus datos para continuar con la reserva.
              </p>
            </div>

            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <BookingForm
                initialData={formData || undefined}
                onSubmit={handleFormSubmit}
                onBack={handleBackFromForm}
              />
            </div>
          </div>
        )}

        {/* Step 3: Review and Confirm */}
        {currentStep === 3 && selectedRange.from && selectedRange.to && formData && (
          <BookingReview
            dates={{
              from: selectedRange.from,
              to: selectedRange.to,
            }}
            formData={formData}
            onSubmit={handleFinalSubmit}
            onBack={handleBackFromReview}
            onEditDates={handleEditDates}
            onEditInfo={handleEditInfo}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </BookingLayout>
  );
}
