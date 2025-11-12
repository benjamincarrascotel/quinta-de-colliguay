# 🏡 Quinta de Colliguay - Sistema de Agendamiento

Sistema completo de reservas para casa de veraneo con calendario interactivo, gestión de disponibilidad y panel administrativo.

## 🚀 Tecnologías

### Frontend
- **React 18** + **Vite** + **TypeScript**
- **Tailwind CSS** (tema personalizado "bosque")
- **Atomic Design** (Atoms, Molecules, Organisms)
- **FullCalendar** para calendario interactivo
- **Zustand** para state management
- **React Hook Form** + **Zod** para validaciones

### Backend
- **Node.js 20** + **Express** + **TypeScript**
- **Prisma ORM** (con PostgreSQL)
- **class-validator** para validación de DTOs
- **nodemailer** para emails
- **ical-generator** para archivos de calendario
- **JWT** para autenticación admin
- **Winston** para logging

### Infraestructura
- **Docker Compose** (orquestación completa)
- **PostgreSQL 16** (base de datos)
- **Caddy** (reverse proxy con HTTPS automático)
- **Nginx** (servidor frontend)

---

## 📦 Inicio Rápido

### Prerrequisitos

- Docker y Docker Compose instalados
- Git

### 1. Clonar el repositorio

```bash
git clone https://github.com/benjamincarrascotel/quinta-de-colliguay.git
cd quinta-de-colliguay
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus valores:

```env
JWT_SECRET=tu-clave-secreta-muy-segura
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=tu-usuario-smtp
SMTP_PASSWORD=tu-contraseña-smtp
ADMIN_EMAIL=admin@quintacolliguay.cl
ADMIN_WHATSAPP=912345678
```

### 3. Levantar los servicios

```bash
docker-compose up -d
```

Esto levantará:
- ✅ PostgreSQL (puerto 5432)
- ✅ Backend API (puerto 8000)
- ✅ Frontend React (puerto 3000)
- ✅ Caddy reverse proxy (puerto 80)

### 4. Acceder a la aplicación

- **Frontend:** http://localhost
- **API:** http://localhost/api/v1
- **Admin panel:** http://localhost/admin (próximamente)

### 5. Credenciales de admin por defecto

- **Email:** admin@quintacolliguay.cl
- **Password:** admin123

⚠️ **IMPORTANTE:** Cambia esta contraseña inmediatamente en producción.

---

## 🛠️ Desarrollo Local (sin Docker)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend disponible en: http://localhost:5173

### Backend

```bash
cd backend
npm install

# Crear archivo .env
cp .env.example .env

# Edita .env con tu DATABASE_URL local:
# DATABASE_URL="postgresql://postgres:secret@localhost:5432/quinta_colliguay"

# Generar Prisma Client
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# Seed inicial (admin user + parámetros)
npx prisma db seed

# Iniciar servidor
npm run dev
```

Backend disponible en: http://localhost:8000

---

## 📚 Estructura del Proyecto

```
quinta-de-colliguay/
├── frontend/                    # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/
│   │   │   ├── atoms/          # Botones, inputs, badges
│   │   │   ├── molecules/      # FormField, GuestCounter
│   │   │   ├── organisms/      # Calendar, Forms
│   │   │   └── pages/          # HomePage, AdminPage
│   │   ├── hooks/              # Custom hooks
│   │   ├── services/           # API clients
│   │   ├── types/              # TypeScript types
│   │   └── utils/              # Helpers, constants
│   ├── Dockerfile
│   └── nginx.conf
│
├── backend/                     # Node.js + Express + Prisma
│   ├── prisma/
│   │   ├── schema.prisma       # Schema de base de datos
│   │   └── seed.ts             # Datos iniciales
│   ├── src/
│   │   ├── config/             # Configuración
│   │   ├── controllers/        # Controladores Express
│   │   ├── dtos/               # DTOs con validación
│   │   ├── middlewares/        # Auth, validation, errors
│   │   ├── repositories/       # Acceso a datos (Prisma)
│   │   ├── routes/             # Rutas API
│   │   ├── services/           # Lógica de negocio
│   │   ├── utils/              # Helpers
│   │   └── server.ts           # Entry point
│   ├── Dockerfile
│   └── package.json
│
├── docker/
│   └── Caddyfile               # Configuración reverse proxy
│
├── docker-compose.yml          # Orquestación completa
└── README.md
```

---

## 🔑 API Endpoints

### Público

- `GET /api/v1/availability?from=YYYY-MM-DD&to=YYYY-MM-DD` - Obtener disponibilidad
- `GET /api/v1/parameters` - Obtener parámetros del sistema
- `POST /api/v1/requests` - Crear solicitud de reserva

### Admin (requiere autenticación JWT)

- `GET /api/v1/admin/requests` - Listar reservas (con paginación)
- `GET /api/v1/admin/requests/:id` - Detalle de reserva
- `PATCH /api/v1/admin/requests/:id` - Actualizar reserva
- `POST /api/v1/admin/requests/:id/confirm` - Confirmar reserva
- `POST /api/v1/admin/requests/:id/cancel` - Cancelar reserva
- `GET /api/v1/admin/requests/:id/calendar` - Descargar archivo .ics
- `GET /api/v1/admin/requests/export/csv` - Exportar a CSV

---

## 🗄️ Base de Datos

### Prisma Commands

```bash
# Generar Prisma Client (después de cambios en schema)
npx prisma generate

# Crear nueva migración
npx prisma migrate dev --name nombre-de-migracion

# Aplicar migraciones en producción
npx prisma migrate deploy

# Abrir Prisma Studio (GUI para ver/editar datos)
npx prisma studio

# Reset database (⚠️ elimina todos los datos)
npx prisma migrate reset
```

### Schema Principal

- **clients** - Datos de contacto
- **reservations** - Reservas con fechas y bloques (morning/night)
- **system_parameters** - Configuración del sistema
- **audit_logs** - Trazabilidad completa
- **notifications** - Cola de emails
- **users** - Usuarios admin

---

## 📧 Configuración de Email

### Desarrollo (Mailtrap)

1. Crea una cuenta en [Mailtrap.io](https://mailtrap.io)
2. Obtén tus credenciales SMTP
3. Configura en `.env`:

```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=tu-usuario
SMTP_PASSWORD=tu-contraseña
```

### Producción

Opciones recomendadas:
- **SendGrid**
- **Mailgun**
- **Amazon SES**
- **Gmail** (para volúmenes bajos)

---

## 🔒 Seguridad

### Implementado

✅ CORS configurado
✅ Helmet (security headers)
✅ Rate limiting en endpoints públicos
✅ JWT authentication para admin
✅ Validación robusta con class-validator
✅ Password hashing con bcrypt
✅ HTTPS automático con Caddy (producción)

### Recomendaciones Producción

1. Cambiar JWT_SECRET a valor fuerte
2. Cambiar contraseña de admin por defecto
3. Configurar dominio propio en Caddy
4. Habilitar backups automáticos de PostgreSQL
5. Configurar SSL/TLS para SMTP
6. Implementar monitoring (Sentry, Datadog)

---

## 📊 Reglas de Negocio

### Capacidad
- **Mínimo:** 20 adultos
- **Máximo:** 60 personas total (adultos + niños)
- **Niños:** Hasta 10 años

### Estancia
- **Mínima:** 2 noches
- **Bloques:** Mañana (morning) o Noche (night)
- **Buffer de limpieza:** Medio día automático post-checkout

### Precios (configurables)
- **Adulto:** $20.000 CLP/día
- **Niño:** $10.000 CLP/día
- **Medio día:** 50% de tarifa diaria

### Cancelación
- **≥7 días antes:** Reembolsable
- **<7 días antes:** No reembolsable

---

## 🧪 Testing

```bash
# Frontend
cd frontend
npm test

# Backend
cd backend
npm test
```

---

## 📝 Logs

Los logs del backend se guardan en `backend/logs/`:
- `combined.log` - Todos los logs
- `error.log` - Solo errores

Rotación automática cada día, retención de 14 días.

---

## 🚢 Deployment

### Con Docker (Recomendado)

1. Configura tu servidor con Docker
2. Clona el repositorio
3. Configura `.env`
4. Ejecuta: `docker-compose up -d`

### Manual

#### Frontend (Build estático)

```bash
cd frontend
npm install
npm run build
# Carpeta dist/ lista para servir con Nginx/Apache
```

#### Backend (PM2)

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run build

# Iniciar con PM2
pm2 start dist/server.js --name quinta-backend
pm2 save
pm2 startup
```

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es privado y propietario de Quinta de Colliguay.

---

## 🆘 Soporte

Para problemas o preguntas:
- **Issues:** https://github.com/benjamincarrascotel/quinta-de-colliguay/issues
- **Email:** dev@quintacolliguay.cl

---

## 📈 Roadmap

- [ ] Panel admin React completo
- [ ] Login admin con UI
- [ ] Dashboard con estadísticas
- [ ] Pasarela de pago (WebPay Plus)
- [ ] Multi-idioma (español/inglés)
- [ ] PWA (Progressive Web App)
- [ ] Notificaciones push

---

**Desarrollado con ❤️ para Quinta de Colliguay**
