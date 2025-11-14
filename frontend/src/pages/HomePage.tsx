import { useNavigate } from 'react-router-dom';
import ReservationForm from '../components/organisms/ReservationForm';
import Card from '../components/molecules/Card';
import InfoPanel from '../components/molecules/InfoPanel';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-50 via-white to-earth-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-forest-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-forest-800">Quinta de Colliguay</h1>
                <p className="text-sm text-forest-600">Sistema de Reservas</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-forest-600 hover:text-forest-800 font-medium transition-colors"
            >
              Acceso Admin →
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-forest-700 to-forest-900 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Bienvenido a Quinta de Colliguay
          </h2>
          <p className="text-xl md:text-2xl text-forest-100 mb-2">
            El lugar perfecto para tus eventos y celebraciones
          </p>
          <p className="text-lg text-forest-200">
            Arrienda por días · Capacidad 20-60 personas
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Info Section */}
        <section className="mb-16">
          <h3 className="text-3xl font-bold text-forest-800 text-center mb-8">
            Información General
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <InfoPanel
              title="Capacidad"
              items={[
                'Mínimo: 20 adultos',
                'Máximo: 60 personas total',
                'Niños hasta 10 años',
              ]}
            />

            <InfoPanel
              title="Precios"
              items={[
                'Adulto: $20.000/día',
                'Niño: $10.000/día',
                'Medio día: 50% tarifa',
              ]}
            />

            <InfoPanel
              title="Estadía"
              items={[
                'Mínimo: 2 noches',
                'Check-in: Mañana o Noche',
                'Buffer de limpieza incluido',
              ]}
            />

            <InfoPanel
              title="Ubicación"
              items={[
                'Colliguay',
                'Región de Valparaíso',
                'Entorno natural',
              ]}
            />
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-16">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-forest-800 mb-6 text-center">
              ¿Qué incluye la Quinta?
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-forest-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🏊</span>
                </div>
                <div>
                  <h4 className="font-semibold text-forest-800">Piscina</h4>
                  <p className="text-sm text-gray-600">Amplia piscina para disfrutar</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-forest-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🍖</span>
                </div>
                <div>
                  <h4 className="font-semibold text-forest-800">Quincho</h4>
                  <p className="text-sm text-gray-600">Área de parrilla equipada</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-forest-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🏡</span>
                </div>
                <div>
                  <h4 className="font-semibold text-forest-800">Espacios</h4>
                  <p className="text-sm text-gray-600">Amplios jardines y terrazas</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-forest-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🛏️</span>
                </div>
                <div>
                  <h4 className="font-semibold text-forest-800">Dormitorios</h4>
                  <p className="text-sm text-gray-600">Habitaciones cómodas</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-forest-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🅿️</span>
                </div>
                <div>
                  <h4 className="font-semibold text-forest-800">Estacionamiento</h4>
                  <p className="text-sm text-gray-600">Amplio espacio para vehículos</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-forest-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🌳</span>
                </div>
                <div>
                  <h4 className="font-semibold text-forest-800">Naturaleza</h4>
                  <p className="text-sm text-gray-600">Rodeado de vegetación</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reservation Section */}
        <section id="reservar" className="mb-16">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h3 className="text-3xl font-bold text-forest-800 text-center mb-8">
              Realiza tu Reserva
            </h3>
            <ReservationForm />
          </div>
        </section>

        {/* Policies Section */}
        <section className="mb-16">
          <Card className="bg-earth-50 border-earth-200">
            <h3 className="text-2xl font-bold text-earth-800 mb-6">
              Políticas de Reserva
            </h3>
            <div className="space-y-4 text-sm text-earth-900">
              <div>
                <h4 className="font-semibold mb-2">📋 Proceso de Reserva</h4>
                <ul className="list-disc list-inside space-y-1 text-earth-700">
                  <li>Completa el formulario de solicitud</li>
                  <li>Recibirás confirmación por email</li>
                  <li>El administrador verificará disponibilidad</li>
                  <li>Deberás realizar el anticipo para confirmar</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">💰 Política de Cancelación</h4>
                <ul className="list-disc list-inside space-y-1 text-earth-700">
                  <li>Cancelación con 7+ días: Reembolso completo</li>
                  <li>Cancelación con menos de 7 días: No reembolsable</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">⏰ Horarios</h4>
                <ul className="list-disc list-inside space-y-1 text-earth-700">
                  <li>Bloque Mañana: 08:00 AM</li>
                  <li>Bloque Noche: 08:00 PM</li>
                  <li>Buffer de limpieza: Medio día automático</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">📝 Reglas</h4>
                <ul className="list-disc list-inside space-y-1 text-earth-700">
                  <li>Mínimo 20 adultos para reservar</li>
                  <li>Máximo 60 personas en total</li>
                  <li>Estadía mínima de 2 noches</li>
                  <li>Respeto por el entorno natural</li>
                </ul>
              </div>
            </div>
          </Card>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-forest-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-bold text-lg mb-3">Quinta de Colliguay</h4>
              <p className="text-forest-200 text-sm">
                Tu espacio ideal para eventos, celebraciones y descanso en la naturaleza.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-3">Contacto</h4>
              <ul className="space-y-2 text-forest-200 text-sm">
                <li>📧 reservas@quintacolliguay.cl</li>
                <li>📱 WhatsApp: +56 9 1234 5678</li>
                <li>📍 Colliguay, Región de Valparaíso</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-3">Enlaces</h4>
              <ul className="space-y-2 text-forest-200 text-sm">
                <li>
                  <a href="#reservar" className="hover:text-white transition-colors">
                    Hacer una reserva
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/login')}
                    className="hover:text-white transition-colors"
                  >
                    Acceso administradores
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-forest-700 mt-8 pt-8 text-center text-forest-300 text-sm">
            <p>&copy; {new Date().getFullYear()} Quinta de Colliguay. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
