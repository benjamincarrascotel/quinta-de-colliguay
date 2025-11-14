import { useState } from 'react';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import Button from '../atoms/Button';
import Card from '../molecules/Card';

interface BlockSelectionModalProps {
  isOpen: boolean;
  startDate: Date;
  endDate: Date;
  onConfirm: (arrivalBlock: 'morning' | 'night', departureBlock: 'morning' | 'night') => void;
  onCancel: () => void;
  estimatedPrice?: number;
}

const BlockSelectionModal = ({
  isOpen,
  startDate,
  endDate,
  onConfirm,
  onCancel,
  estimatedPrice,
}: BlockSelectionModalProps) => {
  const [arrivalBlock, setArrivalBlock] = useState<'morning' | 'night'>('night');
  const [departureBlock, setDepartureBlock] = useState<'morning' | 'night'>('morning');

  if (!isOpen) return null;

  const nights = differenceInDays(endDate, startDate);

  const handleConfirm = () => {
    onConfirm(arrivalBlock, departureBlock);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
          {/* Header */}
          <div className="bg-forest-700 text-white px-6 py-4 rounded-t-lg">
            <h2 className="text-2xl font-bold">Selecciona los bloques horarios</h2>
            <p className="text-forest-100 text-sm mt-1">
              Define tu hora de entrada y salida
            </p>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Date Range Summary */}
            <Card className="bg-forest-50 border-forest-200">
              <div className="text-center">
                <p className="text-sm text-forest-600 mb-2">Rango seleccionado</p>
                <p className="text-lg font-bold text-forest-900">
                  {format(startDate, "d 'de' MMMM", { locale: es })}
                  {' → '}
                  {format(endDate, "d 'de' MMMM, yyyy", { locale: es })}
                </p>
                <p className="text-sm text-forest-700 mt-1">
                  {nights} {nights === 1 ? 'noche' : 'noches'}
                </p>
              </div>
            </Card>

            {/* Info Banner */}
            <div className="bg-water-50 border border-water-200 rounded-lg p-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-water-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-sm text-water-800">
                  <p className="font-medium mb-1">Horarios de los bloques:</p>
                  <ul className="space-y-1">
                    <li><strong>Mañana (morning):</strong> 08:00 AM - Puedes entrar desde las 8:00</li>
                    <li><strong>Noche (night):</strong> 08:00 PM - Puedes entrar desde las 20:00</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Arrival Block Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Bloque de entrada ({format(startDate, "d 'de' MMMM", { locale: es })})
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setArrivalBlock('morning')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    arrivalBlock === 'morning'
                      ? 'border-forest-600 bg-forest-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-forest-300'
                  }`}
                >
                  <div className="text-3xl mb-2">🌅</div>
                  <div className="font-semibold text-gray-900">Mañana</div>
                  <div className="text-sm text-gray-600">Desde 08:00 AM</div>
                </button>

                <button
                  onClick={() => setArrivalBlock('night')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    arrivalBlock === 'night'
                      ? 'border-forest-600 bg-forest-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-forest-300'
                  }`}
                >
                  <div className="text-3xl mb-2">🌙</div>
                  <div className="font-semibold text-gray-900">Noche</div>
                  <div className="text-sm text-gray-600">Desde 08:00 PM</div>
                </button>
              </div>
            </div>

            {/* Departure Block Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Bloque de salida ({format(endDate, "d 'de' MMMM", { locale: es })})
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setDepartureBlock('morning')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    departureBlock === 'morning'
                      ? 'border-forest-600 bg-forest-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-forest-300'
                  }`}
                >
                  <div className="text-3xl mb-2">🌅</div>
                  <div className="font-semibold text-gray-900">Mañana</div>
                  <div className="text-sm text-gray-600">Hasta 08:00 AM</div>
                </button>

                <button
                  onClick={() => setDepartureBlock('night')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    departureBlock === 'night'
                      ? 'border-forest-600 bg-forest-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-forest-300'
                  }`}
                >
                  <div className="text-3xl mb-2">🌙</div>
                  <div className="font-semibold text-gray-900">Noche</div>
                  <div className="text-sm text-gray-600">Hasta 08:00 PM</div>
                </button>
              </div>
            </div>

            {/* Price Preview */}
            {estimatedPrice && (
              <Card className="bg-earth-50 border-earth-200">
                <div className="text-center">
                  <p className="text-sm text-earth-600 mb-1">Precio estimado</p>
                  <p className="text-3xl font-bold text-earth-900">
                    ${estimatedPrice.toLocaleString('es-CL')} CLP
                  </p>
                  <p className="text-xs text-earth-600 mt-2">
                    *El precio final puede variar según el número de huéspedes
                  </p>
                </div>
              </Card>
            )}

            {/* Selection Summary */}
            <div className="bg-gray-50 rounded-lg p-4 text-sm">
              <p className="font-medium text-gray-900 mb-2">Resumen de tu selección:</p>
              <ul className="space-y-1 text-gray-700">
                <li>
                  • <strong>Entrada:</strong> {format(startDate, "d 'de' MMMM", { locale: es })}{' '}
                  {arrivalBlock === 'morning' ? '🌅 desde las 08:00 AM' : '🌙 desde las 08:00 PM'}
                </li>
                <li>
                  • <strong>Salida:</strong> {format(endDate, "d 'de' MMMM", { locale: es })}{' '}
                  {departureBlock === 'morning' ? '🌅 hasta las 08:00 AM' : '🌙 hasta las 08:00 PM'}
                </li>
                <li>
                  • <strong>Duración:</strong> {nights} {nights === 1 ? 'noche' : 'noches'}
                </li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={onCancel}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
            >
              Continuar con la reserva
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockSelectionModal;
