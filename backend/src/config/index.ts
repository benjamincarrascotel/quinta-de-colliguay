import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// ============================================
// CONFIGURATION
// ============================================

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '8000', 10),

  // Database
  database: {
    url: process.env.DATABASE_URL!,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // CORS
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  },

  // Email
  email: {
    host: process.env.SMTP_HOST!,
    port: parseInt(process.env.SMTP_PORT || '2525', 10),
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: {
      address: process.env.MAIL_FROM_ADDRESS || 'reservas@quintacolliguay.cl',
      name: process.env.MAIL_FROM_NAME || 'Quinta de Colliguay',
    },
  },

  // Admin
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@quintacolliguay.cl',
    whatsapp: process.env.ADMIN_WHATSAPP || '912345678',
  },

  // Reservation defaults (can be overridden by system_parameters table)
  reservation: {
    adultPrice: parseInt(process.env.RESERVATION_ADULT_PRICE || '20000', 10),
    childPrice: parseInt(process.env.RESERVATION_CHILD_PRICE || '10000', 10),
    minAdults: parseInt(process.env.RESERVATION_MIN_ADULTS || '20', 10),
    maxTotal: parseInt(process.env.RESERVATION_MAX_TOTAL || '60', 10),
    minNights: parseInt(process.env.RESERVATION_MIN_NIGHTS || '2', 10),
    bufferHalfDay: process.env.RESERVATION_BUFFER_HALF_DAY === 'true',
    childMaxAge: parseInt(process.env.RESERVATION_CHILD_MAX_AGE || '10', 10),
    cancellationRefundableDays: parseInt(
      process.env.RESERVATION_CANCELLATION_REFUNDABLE_DAYS || '7',
      10
    ),
  },

  // Timezone
  timezone: process.env.TZ || 'America/Santiago',
};

// Validate required config
const requiredEnvVars = ['DATABASE_URL'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
