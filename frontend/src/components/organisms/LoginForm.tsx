import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { Alert } from '../atoms/Alert';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
}

const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const navigate = useNavigate();
  const { login, error: authError, clearError } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    clearError();

    try {
      await login(data.email, data.password);

      // Call success callback or navigate to admin
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/admin');
      }
    } catch (error) {
      // Error is handled by the store
      console.error('Login failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-forest-800 mb-2">
            Panel de Administración
          </h1>
          <p className="text-forest-600">
            Ingresa tus credenciales para continuar
          </p>
        </div>

        {/* Error Alert */}
        {authError && (
          <Alert variant="error" className="mb-6" onDismiss={clearError} dismissible={true}>
            {authError}
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="admin@quintacolliguay.cl"
              {...register('email')}
              variant={errors.email?.message ? "error" : "default"}
              disabled={isSubmitting}
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              variant={errors.password?.message ? "error" : "default"}
              disabled={isSubmitting}
            />
          </div>

          {/* Forgot Password Link */}
          <div className="flex items-center justify-end">
            <button
              type="button"
              className="text-sm text-forest-600 hover:text-forest-800 transition-colors"
              onClick={() => {
                // TODO: Implement forgot password functionality
                alert('Funcionalidad próximamente disponible');
              }}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Iniciar Sesión
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Quinta de Colliguay · Sistema de Reservas
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-4 bg-forest-50 rounded-lg p-4 text-center">
        <p className="text-sm text-forest-700">
          <strong>Credenciales de prueba:</strong><br />
          Email: admin@quintacolliguay.cl<br />
          Contraseña: admin123
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
