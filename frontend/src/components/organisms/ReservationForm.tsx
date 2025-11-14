import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAvailabilityStore } from '../../stores/availabilityStore';
import { useReservationStore } from '../../stores/reservationStore';
import Calendar from './Calendar';
import BlockSelectionModal from './BlockSelectionModal';
import { GuestCounter } from '../molecules/GuestCounter';
import { PriceDisplay } from '../molecules/PriceDisplay';
import { FormField } from '../molecules/FormField';
import { Button } from '../atoms/Button';
import { Alert } from '../atoms/Alert';
import { Card } from '../molecules/Card';
import { Select } from '../atoms/Select';
import { CHILEAN_CITIES as CITIES } from '../../utils/constants';

// Validation schema
const reservationSchema = z.object({
  // Dates (handled separately)
  arrivalDate: z.string(),
  arrivalBlock: z.enum(['morning', 'night']),
  departureDate: z.string(),
  departureBlock: z.enum(['morning', 'night']),

  // Guests
  adults: z.number().min(20, 'Mínimo 20 adultos').max(60, 'Máximo 60 personas'),
  children: z.number().min(0).max(40, 'Máximo 40 niños'),

  // Contact
  name: z.string().min(3, 'Nombre muy corto').max(100, 'Nombre muy largo'),
  email: z.string().email('Email inválido'),
  whatsapp: z.string().min(9, 'WhatsApp inválido').max(15, 'WhatsApp inválido'),
  city: z.string().min(2, 'Selecciona una ciudad'),
  observations: z.string().max(500, 'Máximo 500 caracteres').optional(),

  // Terms
  acceptTerms: z.boolean().refine(val => val === true, 'Debes aceptar los términos'),
});

type ReservationFormData = z.infer<typeof reservationSchema>;

const STEPS = [
  { number: 1, title: 'Fechas' },
  { number: 2, title: 'Huéspedes' },
  { number: 3, title: 'Contacto' },
  { number: 4, title: 'Confirmación' },
];

const ReservationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { selectedRange, selectedBlocks, setBlocks, clearSelection } = useAvailabilityStore();
  const { createReservation, isLoading, error: reservationError, clearError } = useReservationStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
    reset,
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      arrivalDate: '',
      arrivalBlock: 'night',
      departureDate: '',
      departureBlock: 'morning',
      adults: 20,
      children: 0,
      name: '',
      email: '',
      whatsapp: '',
      city: '',
      observations: '',
      acceptTerms: false,
    },
  });

  const adults = watch('adults');
  const children = watch('children');

  // Calculate estimated price breakdown (simplified, should match backend logic)
  const calculatePriceBreakdown = () => {
    if (!selectedRange.from || !selectedRange.to) {
      return {
        adults: adults,
        children: children,
        full_days: 0,
        half_days: 0,
        adult_subtotal: 0,
        child_subtotal: 0,
        total: 0,
      };
    }

    const nights = differenceInDays(selectedRange.to, selectedRange.from);
    const adultPrice = 20000; // Should come from system parameters
    const childPrice = 10000;

    // Simplified calculation (backend has more complex logic with blocks)
    const adult_subtotal = nights * adults * adultPrice;
    const child_subtotal = nights * children * childPrice;

    return {
      adults: adults,
      children: children,
      full_days: nights,
      half_days: 0,
      adult_subtotal,
      child_subtotal,
      total: adult_subtotal + child_subtotal,
    };
  };

  // Handle date selection from calendar
  const handleDateSelect = () => {
    setShowBlockModal(true);
  };

  // Handle block confirmation
  const handleBlockConfirm = (arrivalBlock: 'morning' | 'night', departureBlock: 'morning' | 'night') => {
    setBlocks({ arrivalBlock, departureBlock });

    if (selectedRange.from && selectedRange.to) {
      setValue('arrivalDate', format(selectedRange.from, 'yyyy-MM-dd'));
      setValue('arrivalBlock', arrivalBlock);
      setValue('departureDate', format(selectedRange.to, 'yyyy-MM-dd'));
      setValue('departureBlock', departureBlock);
    }

    setShowBlockModal(false);
  };

  // Navigate steps
  const goToNextStep = async () => {
    let fieldsToValidate: (keyof ReservationFormData)[] = [];

    if (currentStep === 1) {
      fieldsToValidate = ['arrivalDate', 'arrivalBlock', 'departureDate', 'departureBlock'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['adults', 'children'];
    } else if (currentStep === 3) {
      fieldsToValidate = ['name', 'email', 'whatsapp', 'city'];
    }

    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const goToPrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Submit form
  const onSubmit = async (data: ReservationFormData) => {
    clearError();

    try {
      const breakdown = calculatePriceBreakdown();

      const reservationInput = {
        arrival_date: data.arrivalDate,
        arrival_block: data.arrivalBlock,
        departure_date: data.departureDate,
        departure_block: data.departureBlock,
        adults: data.adults,
        children: data.children,
        client: {
          name: data.name,
          email: data.email,
          whatsapp: data.whatsapp,
          city: data.city,
        },
        estimated_amount: breakdown.total,
        client_observations: data.observations || undefined,
      };

      await createReservation(reservationInput);

      // Success!
      setIsSuccess(true);
      setCurrentStep(1);
      reset();
      clearSelection();

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error creating reservation:', error);
    }
  };

  // Reset success state after timeout
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => setIsSuccess(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-forest-800">
              Selecciona las fechas de tu reserva
            </h3>
            <p className="text-gray-600">
              Haz clic en el calendario para seleccionar la fecha de entrada y salida (mínimo 2 noches)
            </p>

            <Calendar
              onDateSelect={handleDateSelect}
              selectable={true}
            />

            {selectedRange.from && selectedRange.to && selectedBlocks && (
              <Card className="bg-forest-50 border-forest-200">
                <div className="space-y-2">
                  <p className="font-medium text-forest-900">Fechas seleccionadas:</p>
                  <p className="text-sm text-forest-700">
                    <strong>Entrada:</strong> {format(selectedRange.from, "d 'de' MMMM, yyyy", { locale: es })}{' '}
                    {selectedBlocks.arrivalBlock === 'morning' ? '🌅 Mañana' : '🌙 Noche'}
                  </p>
                  <p className="text-sm text-forest-700">
                    <strong>Salida:</strong> {format(selectedRange.to, "d 'de' MMMM, yyyy", { locale: es })}{' '}
                    {selectedBlocks.departureBlock === 'morning' ? '🌅 Mañana' : '🌙 Noche'}
                  </p>
                  <p className="text-sm text-forest-700">
                    <strong>Noches:</strong> {differenceInDays(selectedRange.to, selectedRange.from)}
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => clearSelection()}
                  >
                    Cambiar fechas
                  </Button>
                </div>
              </Card>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-forest-800 mb-2">
                ¿Cuántos serán?
              </h3>
              <p className="text-gray-600">
                Mínimo 20 adultos, máximo 60 personas en total
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adultos (requerido mínimo 20)
                </label>
                <GuestCounter
            label="Adultos"
            value={adults}
                  onChange={(value) => setValue('adults', value)}
                  min={20}
                  max={60 - children}
                />
                {errors.adults && (
                  <p className="mt-1 text-sm text-red-600">{errors.adults.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Niños (hasta 10 años)
                </label>
                <GuestCounter
            label="Niños (hasta 10 años)"
            value={children}
                  onChange={(value) => setValue('children', value)}
                  min={0}
                  max={60 - adults}
                />
                {errors.children && (
                  <p className="mt-1 text-sm text-red-600">{errors.children.message}</p>
                )}
              </div>

              <Card className="bg-water-50 border-water-200">
                <p className="text-sm text-water-800">
                  <strong>Total de personas:</strong> {adults + children}
                  {(adults + children > 60) && (
                    <span className="text-red-600 ml-2">
                      ⚠️ Excede el máximo permitido (60)
                    </span>
                  )}
                </p>
              </Card>
            </div>

            <PriceDisplay
              breakdown={calculatePriceBreakdown()}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-forest-800 mb-2">
                Tus datos de contacto
              </h3>
              <p className="text-gray-600">
                Te enviaremos la confirmación a este email
              </p>
            </div>

            <div className="space-y-4">
              <FormField
                label="Nombre completo"
                error={errors.name?.message}
                required
              >
                <input
                  {...register('name')}
                  type="text"
                  placeholder="Juan Pérez"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-transparent"
                />
              </FormField>

              <FormField
                label="Email"
                error={errors.email?.message}
                required
              >
                <input
                  {...register('email')}
                  type="email"
                  placeholder="juan@ejemplo.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-transparent"
                />
              </FormField>

              <FormField
                label="WhatsApp"
                error={errors.whatsapp?.message}
                required
              >
                <input
                  {...register('whatsapp')}
                  type="tel"
                  placeholder="+56912345678"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-transparent"
                />
              </FormField>

              <FormField
                label="Ciudad"
                error={errors.city?.message}
                required
              >
                <Select
                  {...register('city')}
                  options={CITIES.map((city) => ({ value: city, label: city }))}
                  placeholder="Selecciona tu ciudad"
                />
              </FormField>

              <FormField
                label="Observaciones (opcional)"
                error={errors.observations?.message}
              >
                <textarea
                  {...register('observations')}
                  rows={4}
                  placeholder="Algún comentario o solicitud especial..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-transparent resize-none"
                  maxLength={500}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {watch('observations')?.length || 0}/500 caracteres
                </p>
              </FormField>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-forest-800 mb-2">
                Revisa y confirma tu solicitud
              </h3>
              <p className="text-gray-600">
                Verifica que toda la información sea correcta antes de enviar
              </p>
            </div>

            {/* Summary Cards */}
            <div className="space-y-4">
              {/* Dates */}
              <Card>
                <h4 className="font-semibold text-forest-800 mb-3">📅 Fechas</h4>
                <div className="text-sm space-y-1 text-gray-700">
                  <p>
                    <strong>Entrada:</strong> {selectedRange.from && format(selectedRange.from, "d 'de' MMMM, yyyy", { locale: es })}{' '}
                    {selectedBlocks.arrivalBlock === 'morning' ? '🌅 Mañana (08:00)' : '🌙 Noche (20:00)'}
                  </p>
                  <p>
                    <strong>Salida:</strong> {selectedRange.to && format(selectedRange.to, "d 'de' MMMM, yyyy", { locale: es })}{' '}
                    {selectedBlocks.departureBlock === 'morning' ? '🌅 Mañana (08:00)' : '🌙 Noche (20:00)'}
                  </p>
                  <p>
                    <strong>Noches:</strong> {selectedRange.from && selectedRange.to && differenceInDays(selectedRange.to, selectedRange.from)}
                  </p>
                </div>
              </Card>

              {/* Guests */}
              <Card>
                <h4 className="font-semibold text-forest-800 mb-3">👥 Huéspedes</h4>
                <div className="text-sm space-y-1 text-gray-700">
                  <p><strong>Adultos:</strong> {adults}</p>
                  <p><strong>Niños:</strong> {children}</p>
                  <p><strong>Total:</strong> {adults + children} personas</p>
                </div>
              </Card>

              {/* Contact */}
              <Card>
                <h4 className="font-semibold text-forest-800 mb-3">📧 Contacto</h4>
                <div className="text-sm space-y-1 text-gray-700">
                  <p><strong>Nombre:</strong> {watch('name')}</p>
                  <p><strong>Email:</strong> {watch('email')}</p>
                  <p><strong>WhatsApp:</strong> {watch('whatsapp')}</p>
                  <p><strong>Ciudad:</strong> {watch('city')}</p>
                  {watch('observations') && (
                    <p><strong>Observaciones:</strong> {watch('observations')}</p>
                  )}
                </div>
              </Card>

              {/* Price */}
              <PriceDisplay
                breakdown={calculatePriceBreakdown()}
              />

              {/* Terms */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  {...register('acceptTerms')}
                  type="checkbox"
                  id="acceptTerms"
                  className="mt-1 w-4 h-4 text-forest-600 border-gray-300 rounded focus:ring-forest-500"
                />
                <label htmlFor="acceptTerms" className="text-sm text-gray-700 cursor-pointer">
                  Acepto los términos y condiciones. Entiendo que esta es una solicitud de reserva
                  y será confirmada por el administrador tras verificar disponibilidad y recibir el anticipo.
                </label>
              </div>
              {errors.acceptTerms && (
                <p className="text-sm text-red-600">{errors.acceptTerms.message}</p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Success view
  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="bg-green-50 border-green-200 text-center py-12">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-3xl font-bold text-green-800 mb-4">
            ¡Solicitud enviada con éxito!
          </h2>
          <p className="text-green-700 mb-6">
            Hemos recibido tu solicitud de reserva. Te enviaremos un email de confirmación
            y nos pondremos en contacto contigo a la brevedad.
          </p>
          <Button
            variant="primary"
            onClick={() => {
              setIsSuccess(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Hacer otra reserva
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    currentStep >= step.number
                      ? 'bg-forest-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {currentStep > step.number ? '✓' : step.number}
                </div>
                <p className={`mt-2 text-sm font-medium ${
                  currentStep >= step.number ? 'text-forest-800' : 'text-gray-500'
                }`}>
                  {step.title}
                </p>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    currentStep > step.number ? 'bg-forest-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error Alert */}
      {reservationError && (
        <Alert variant="error" className="mb-6" onDismiss={clearError} dismissible={true}>
          {reservationError}
        </Alert>
      )}

      {/* Step Content */}
      <div className="mb-8">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="secondary"
          onClick={goToPrevStep}
          disabled={currentStep === 1 || isLoading}
        >
          ← Atrás
        </Button>

        {currentStep < STEPS.length ? (
          <Button
            variant="primary"
            onClick={goToNextStep}
            disabled={
              (currentStep === 1 && (!selectedRange.from || !selectedRange.to)) ||
              isLoading
            }
          >
            Siguiente →
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleSubmit(onSubmit)}
            isLoading={isLoading}
            disabled={isLoading}
          >
            Enviar Solicitud
          </Button>
        )}
      </div>

      {/* Block Selection Modal */}
      {selectedRange.from && selectedRange.to && (
        <BlockSelectionModal
          isOpen={showBlockModal}
          startDate={selectedRange.from}
          endDate={selectedRange.to}
          onConfirm={handleBlockConfirm}
          onCancel={() => setShowBlockModal(false)}
          estimatedPrice={calculatePriceBreakdown().total}
        />
      )}
    </div>
  );
};

export default ReservationForm;
