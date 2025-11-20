/**
 * BOOKING FORM COMPONENT
 *
 * Captures guest information for a booking reservation.
 * Step 2 of the booking wizard.
 *
 * Fields:
 * - Full Name (required)
 * - Email (required, validated)
 * - Phone (required)
 * - Number of Guests (required, 1-20)
 * - Special Requests (optional)
 */

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface BookingFormData {
  fullName: string;
  email: string;
  phone: string;
  guestCount: number;
  specialRequests: string;
}

interface BookingFormProps {
  initialData?: Partial<BookingFormData>;
  onSubmit: (data: BookingFormData) => void;
  onBack: () => void;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  guestCount?: string;
}

export default function BookingForm({ initialData, onSubmit, onBack }: BookingFormProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    fullName: initialData?.fullName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    guestCount: initialData?.guestCount || 2,
    specialRequests: initialData?.specialRequests || '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validation functions
  const validateFullName = (value: string): string | undefined => {
    if (!value.trim()) {
      return 'El nombre completo es requerido';
    }
    if (value.trim().length < 3) {
      return 'El nombre debe tener al menos 3 caracteres';
    }
    return undefined;
  };

  const validateEmail = (value: string): string | undefined => {
    if (!value.trim()) {
      return 'El email es requerido';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Por favor ingresa un email válido';
    }
    return undefined;
  };

  const validatePhone = (value: string): string | undefined => {
    if (!value.trim()) {
      return 'El teléfono es requerido';
    }
    const phoneRegex = /^[+]?[\d\s()-]{8,}$/;
    if (!phoneRegex.test(value)) {
      return 'Por favor ingresa un teléfono válido';
    }
    return undefined;
  };

  const validateGuestCount = (value: number): string | undefined => {
    if (value < 1) {
      return 'Debe haber al menos 1 huésped';
    }
    if (value > 20) {
      return 'El máximo es 20 huéspedes';
    }
    return undefined;
  };

  // Handle input change
  const handleChange = (field: keyof BookingFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle blur (mark field as touched)
  const handleBlur = (field: keyof FormErrors) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    // Validate on blur
    let error: string | undefined;
    switch (field) {
      case 'fullName':
        error = validateFullName(formData.fullName);
        break;
      case 'email':
        error = validateEmail(formData.email);
        break;
      case 'phone':
        error = validatePhone(formData.phone);
        break;
      case 'guestCount':
        error = validateGuestCount(formData.guestCount);
        break;
    }

    if (error) {
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  // Handle form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: FormErrors = {
      fullName: validateFullName(formData.fullName),
      email: validateEmail(formData.email),
      phone: validatePhone(formData.phone),
      guestCount: validateGuestCount(formData.guestCount),
    };

    // Filter out undefined errors
    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([_, v]) => v !== undefined)
    ) as FormErrors;

    if (Object.keys(filteredErrors).length > 0) {
      setErrors(filteredErrors);
      // Mark all fields as touched
      setTouched({
        fullName: true,
        email: true,
        phone: true,
        guestCount: true,
      });
      return;
    }

    // Submit form
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName">
            Nombre Completo <span className="text-destructive">*</span>
          </Label>
          <Input
            id="fullName"
            type="text"
            value={formData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            onBlur={() => handleBlur('fullName')}
            aria-invalid={touched.fullName && errors.fullName ? true : false}
            placeholder="Juan Pérez"
            autoComplete="name"
          />
          {touched.fullName && errors.fullName && (
            <p className="text-sm text-destructive">{errors.fullName}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            aria-invalid={touched.email && errors.email ? true : false}
            placeholder="juan@ejemplo.com"
            autoComplete="email"
          />
          {touched.email && errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">
            Teléfono <span className="text-destructive">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            onBlur={() => handleBlur('phone')}
            aria-invalid={touched.phone && errors.phone ? true : false}
            placeholder="+56 9 1234 5678"
            autoComplete="tel"
          />
          {touched.phone && errors.phone && (
            <p className="text-sm text-destructive">{errors.phone}</p>
          )}
        </div>

        {/* Guest Count */}
        <div className="space-y-2">
          <Label htmlFor="guestCount">
            Número de Huéspedes <span className="text-destructive">*</span>
          </Label>
          <Input
            id="guestCount"
            type="number"
            min="1"
            max="20"
            value={formData.guestCount}
            onChange={(e) => handleChange('guestCount', parseInt(e.target.value) || 1)}
            onBlur={() => handleBlur('guestCount')}
            aria-invalid={touched.guestCount && errors.guestCount ? true : false}
          />
          {touched.guestCount && errors.guestCount && (
            <p className="text-sm text-destructive">{errors.guestCount}</p>
          )}
        </div>

        {/* Special Requests */}
        <div className="space-y-2">
          <Label htmlFor="specialRequests">Solicitudes Especiales (opcional)</Label>
          <textarea
            id="specialRequests"
            value={formData.specialRequests}
            onChange={(e) => handleChange('specialRequests', e.target.value)}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            placeholder="Ejemplo: Necesito cuna para bebé, llegada tardía, etc."
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            Máximo 500 caracteres ({formData.specialRequests.length}/500)
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Volver
        </Button>
        <Button type="submit" className="flex-1">
          Continuar a Confirmación
        </Button>
      </div>
    </form>
  );
}
