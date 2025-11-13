import { useState, useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { ReservationFormData, FormStep, BlockType, ValidationResult, ValidationError } from '@/types/index';
import {
  calculateDuration,
  calculatePrice,
  calculateNights,
  isValidEmail,
  isValidChileanPhone,
  isValidDateRange,
} from '@utils/helpers';
import { DEFAULT_PARAMETERS, VALIDATION_MESSAGES } from '@utils/constants';

// ============================================
// USE RESERVATION FORM - Hook para formulario multi-step de reservas
// Maneja estado, validaciones, navegación entre pasos y persistencia
// ============================================

export interface UseReservationFormOptions {
  initialData?: Partial<ReservationFormData>;
  onComplete?: (data: ReservationFormData) => void;
  persistKey?: string; // Key para localStorage
}

export interface UseReservationFormResult {
  // Estado del formulario
  formData: ReservationFormData;
  currentStep: FormStep;
  completedSteps: Set<FormStep>;

  // Navegación
  goToStep: (step: FormStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;

  // Actualización de datos
  updateFormData: (data: Partial<ReservationFormData>) => void;
  updateDates: (arrivalDate: string, arrivalBlock: BlockType, departureDate: string, departureBlock: BlockType) => void;
  updateGuests: (adults: number, children: number) => void;
  updateClient: (clientData: Partial<ReservationFormData>) => void;

  // Validaciones
  validateCurrentStep: () => ValidationResult;
  isStepValid: (step: FormStep) => boolean;

  // Cálculos
  estimatedPrice: number;
  nights: number;
  totalGuests: number;

  // Utilidades
  reset: () => void;
  clearPersistedData: () => void;
}

const stepOrder: FormStep[] = ['dates', 'guests', 'contact', 'confirmation'];

const initialFormData: ReservationFormData = {
  adults: DEFAULT_PARAMETERS.MIN_ADULTS,
  children: 0,
};

export function useReservationForm(options: UseReservationFormOptions = {}): UseReservationFormResult {
  const { initialData, onComplete, persistKey = 'reservation_form' } = options;

  // Estado persistido en localStorage
  const [formData, setFormData, clearFormData] = useLocalStorage<ReservationFormData>(
    persistKey,
    { ...initialFormData, ...initialData }
  );

  const [currentStep, setCurrentStep] = useState<FormStep>('dates');
  const [completedSteps, setCompletedSteps] = useState<Set<FormStep>>(new Set());

  // ============================================
  // NAVEGACIÓN
  // ============================================

  const currentStepIndex = stepOrder.indexOf(currentStep);
  const canGoPrevious = currentStepIndex > 0;
  const canGoNext = currentStepIndex < stepOrder.length - 1;

  const goToStep = useCallback((step: FormStep) => {
    setCurrentStep(step);
  }, []);

  const nextStep = useCallback(() => {
    if (canGoNext) {
      const validation = validateCurrentStep();
      if (validation.valid) {
        setCompletedSteps((prev) => new Set([...prev, currentStep]));
        setCurrentStep(stepOrder[currentStepIndex + 1]);

        // Si llegamos al último paso, ejecutar onComplete
        if (stepOrder[currentStepIndex + 1] === 'confirmation' && onComplete) {
          onComplete(formData);
        }
      }
    }
  }, [canGoNext, currentStep, currentStepIndex, formData, onComplete]);

  const previousStep = useCallback(() => {
    if (canGoPrevious) {
      setCurrentStep(stepOrder[currentStepIndex - 1]);
    }
  }, [canGoPrevious, currentStepIndex]);

  // ============================================
  // ACTUALIZACIÓN DE DATOS
  // ============================================

  const updateFormData = useCallback((data: Partial<ReservationFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, [setFormData]);

  const updateDates = useCallback(
    (arrivalDate: string, arrivalBlock: BlockType, departureDate: string, departureBlock: BlockType) => {
      updateFormData({
        arrival_date: arrivalDate,
        arrival_block: arrivalBlock,
        departure_date: departureDate,
        departure_block: departureBlock,
      });
    },
    [updateFormData]
  );

  const updateGuests = useCallback(
    (adults: number, children: number) => {
      updateFormData({ adults, children });
    },
    [updateFormData]
  );

  const updateClient = useCallback(
    (clientData: Partial<ReservationFormData>) => {
      updateFormData(clientData);
    },
    [updateFormData]
  );

  // ============================================
  // VALIDACIONES
  // ============================================

  const validateDates = useCallback((): ValidationResult => {
    const errors: ValidationError[] = [];

    if (!formData.arrival_date) {
      errors.push({ field: 'arrival_date', message: 'Selecciona una fecha de llegada' });
    }

    if (!formData.departure_date) {
      errors.push({ field: 'departure_date', message: 'Selecciona una fecha de salida' });
    }

    if (!formData.arrival_block) {
      errors.push({ field: 'arrival_block', message: 'Selecciona el bloque de llegada' });
    }

    if (!formData.departure_block) {
      errors.push({ field: 'departure_block', message: 'Selecciona el bloque de salida' });
    }

    if (formData.arrival_date && formData.departure_date) {
      if (!isValidDateRange(formData.arrival_date, formData.departure_date)) {
        errors.push({ field: 'departure_date', message: VALIDATION_MESSAGES.INVALID_DATE_RANGE });
      }

      if (
        formData.arrival_block &&
        formData.departure_block &&
        isValidDateRange(formData.arrival_date, formData.departure_date)
      ) {
        const nights = calculateNights(
          formData.arrival_date,
          formData.arrival_block,
          formData.departure_date,
          formData.departure_block
        );

        if (nights < DEFAULT_PARAMETERS.MIN_NIGHTS) {
          errors.push({ field: 'departure_date', message: VALIDATION_MESSAGES.MIN_NIGHTS });
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }, [formData]);

  const validateGuests = useCallback((): ValidationResult => {
    const errors: ValidationError[] = [];

    if (!formData.adults || formData.adults < DEFAULT_PARAMETERS.MIN_ADULTS) {
      errors.push({ field: 'adults', message: VALIDATION_MESSAGES.MIN_ADULTS });
    }

    const total = (formData.adults || 0) + (formData.children || 0);
    if (total > DEFAULT_PARAMETERS.MAX_TOTAL_PEOPLE) {
      errors.push({ field: 'total', message: VALIDATION_MESSAGES.MAX_PEOPLE });
    }

    return { valid: errors.length === 0, errors };
  }, [formData]);

  const validateContact = useCallback((): ValidationResult => {
    const errors: ValidationError[] = [];

    if (!formData.client_name?.trim()) {
      errors.push({ field: 'client_name', message: VALIDATION_MESSAGES.REQUIRED_FIELD });
    }

    if (!formData.client_email?.trim()) {
      errors.push({ field: 'client_email', message: VALIDATION_MESSAGES.REQUIRED_FIELD });
    } else if (!isValidEmail(formData.client_email)) {
      errors.push({ field: 'client_email', message: VALIDATION_MESSAGES.INVALID_EMAIL });
    }

    if (!formData.client_whatsapp?.trim()) {
      errors.push({ field: 'client_whatsapp', message: VALIDATION_MESSAGES.REQUIRED_FIELD });
    } else if (!isValidChileanPhone(formData.client_whatsapp)) {
      errors.push({ field: 'client_whatsapp', message: VALIDATION_MESSAGES.INVALID_PHONE });
    }

    if (!formData.client_city?.trim()) {
      errors.push({ field: 'client_city', message: VALIDATION_MESSAGES.REQUIRED_FIELD });
    }

    return { valid: errors.length === 0, errors };
  }, [formData]);

  const validateCurrentStep = useCallback((): ValidationResult => {
    switch (currentStep) {
      case 'dates':
        return validateDates();
      case 'guests':
        return validateGuests();
      case 'contact':
        return validateContact();
      case 'confirmation':
        return { valid: true, errors: [] };
      default:
        return { valid: false, errors: [] };
    }
  }, [currentStep, validateDates, validateGuests, validateContact]);

  const isStepValid = useCallback(
    (step: FormStep): boolean => {
      const currentStepBackup = currentStep;
      setCurrentStep(step);
      const result = validateCurrentStep();
      setCurrentStep(currentStepBackup);
      return result.valid;
    },
    [currentStep, validateCurrentStep]
  );

  // ============================================
  // CÁLCULOS
  // ============================================

  const estimatedPrice = useMemo(() => {
    if (
      !formData.arrival_date ||
      !formData.departure_date ||
      !formData.arrival_block ||
      !formData.departure_block ||
      !formData.adults
    ) {
      return 0;
    }

    const { fullDays, halfDays } = calculateDuration(
      formData.arrival_date,
      formData.arrival_block,
      formData.departure_date,
      formData.departure_block
    );

    const { total } = calculatePrice(
      formData.adults,
      formData.children || 0,
      fullDays,
      halfDays,
      DEFAULT_PARAMETERS.ADULT_PRICE_PER_DAY,
      DEFAULT_PARAMETERS.CHILD_PRICE_PER_DAY
    );

    return total;
  }, [formData]);

  const nights = useMemo(() => {
    if (
      !formData.arrival_date ||
      !formData.departure_date ||
      !formData.arrival_block ||
      !formData.departure_block
    ) {
      return 0;
    }

    return calculateNights(
      formData.arrival_date,
      formData.arrival_block,
      formData.departure_date,
      formData.departure_block
    );
  }, [formData]);

  const totalGuests = useMemo(() => {
    return (formData.adults || 0) + (formData.children || 0);
  }, [formData]);

  // ============================================
  // UTILIDADES
  // ============================================

  const reset = useCallback(() => {
    setFormData({ ...initialFormData, ...initialData });
    setCurrentStep('dates');
    setCompletedSteps(new Set());
  }, [setFormData, initialData]);

  const clearPersistedData = useCallback(() => {
    clearFormData();
  }, [clearFormData]);

  return {
    formData,
    currentStep,
    completedSteps,
    goToStep,
    nextStep,
    previousStep,
    canGoNext,
    canGoPrevious,
    updateFormData,
    updateDates,
    updateGuests,
    updateClient,
    validateCurrentStep,
    isStepValid,
    estimatedPrice,
    nights,
    totalGuests,
    reset,
    clearPersistedData,
  };
}
