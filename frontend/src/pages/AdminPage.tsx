import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import Button from '../components/atoms/Button';
import Card from '../components/molecules/Card';

const AdminPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-50 via-white to-earth-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-200">
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-forest-800">Panel de Administración</h1>
                <p className="text-sm text-forest-600">Quinta de Colliguay</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-forest-800 mb-2">
            Bienvenido, {user?.name?.split(' ')[0] || 'Admin'}! 👋
          </h2>
          <p className="text-gray-600">
            Este es el panel de administración de Quinta de Colliguay
          </p>
        </div>

        {/* Under Construction Notice */}
        <Card className="bg-amber-50 border-amber-200 mb-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                <span className="text-2xl">🚧</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-amber-900 mb-2">
                Panel en Construcción
              </h3>
              <p className="text-amber-800 mb-4">
                El panel de administración completo está en desarrollo. Próximamente podrás:
              </p>
              <ul className="space-y-2 text-sm text-amber-900">
                <li className="flex items-center gap-2">
                  <span className="text-amber-600">•</span>
                  Ver y gestionar todas las reservas
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-600">•</span>
                  Confirmar o cancelar solicitudes
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-600">•</span>
                  Ver estadísticas y métricas
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-600">•</span>
                  Exportar reportes en CSV
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-600">•</span>
                  Configurar parámetros del sistema
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-forest-500 to-forest-700 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-forest-100 text-sm">Reservas Pendientes</p>
                <p className="text-3xl font-bold mt-1">--</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Confirmadas</p>
                <p className="text-3xl font-bold mt-1">--</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-amber-700 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm">Este Mes</p>
                <p className="text-3xl font-bold mt-1">--</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Ingresos Mes</p>
                <p className="text-3xl font-bold mt-1">--</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-not-allowed opacity-75">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-forest-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📋</span>
              </div>
              <h3 className="text-xl font-bold text-forest-800 mb-2">
                Gestión de Reservas
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Ver, confirmar y gestionar todas las reservas
              </p>
              <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                Próximamente
              </div>
            </div>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-not-allowed opacity-75">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-water-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-forest-800 mb-2">
                Dashboard
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Estadísticas y métricas de ocupación
              </p>
              <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                Próximamente
              </div>
            </div>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-not-allowed opacity-75">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-earth-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📅</span>
              </div>
              <h3 className="text-xl font-bold text-forest-800 mb-2">
                Calendario
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Vista de calendario con todas las reservas
              </p>
              <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                Próximamente
              </div>
            </div>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-not-allowed opacity-75">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📥</span>
              </div>
              <h3 className="text-xl font-bold text-forest-800 mb-2">
                Exportar Datos
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Descargar reportes en CSV
              </p>
              <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                Próximamente
              </div>
            </div>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-not-allowed opacity-75">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">⚙️</span>
              </div>
              <h3 className="text-xl font-bold text-forest-800 mb-2">
                Configuración
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Parámetros del sistema y precios
              </p>
              <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                Próximamente
              </div>
            </div>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer hover:border-forest-300"
            onClick={() => navigate('/')}
          >
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-forest-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🏡</span>
              </div>
              <h3 className="text-xl font-bold text-forest-800 mb-2">
                Vista Pública
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Ver el sitio público de reservas
              </p>
              <div className="inline-block px-3 py-1 bg-forest-100 text-forest-800 text-xs font-medium rounded-full">
                Ir al sitio →
              </div>
            </div>
          </Card>
        </div>

        {/* API Info */}
        <Card className="mt-8 bg-gray-50">
          <h3 className="font-bold text-gray-900 mb-4">Estado del Sistema</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 mb-1">Backend API</p>
              <p className="font-mono text-xs text-gray-800">
                {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}
              </p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Usuario conectado</p>
              <p className="font-medium text-gray-900">{user?.email}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminPage;
