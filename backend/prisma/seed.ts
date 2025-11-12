import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Crear usuario admin
  const adminPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@quintacolliguay.cl' },
    update: {},
    create: {
      name: 'Mana (Admin)',
      email: 'admin@quintacolliguay.cl',
      password: adminPassword,
      role: 'super_admin',
      emailVerifiedAt: new Date(),
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Crear parámetros del sistema
  const parameters = [
    {
      key: 'adult_price_per_day',
      value: '20000',
      type: 'integer',
      description: 'Precio por adulto por día (CLP)',
    },
    {
      key: 'child_price_per_day',
      value: '10000',
      type: 'integer',
      description: 'Precio por niño por día (CLP)',
    },
    {
      key: 'min_adults',
      value: '20',
      type: 'integer',
      description: 'Mínimo de adultos requeridos',
    },
    {
      key: 'max_total_people',
      value: '60',
      type: 'integer',
      description: 'Máximo total de personas (adultos + niños)',
    },
    {
      key: 'min_nights',
      value: '2',
      type: 'integer',
      description: 'Mínimo de noches requeridas',
    },
    {
      key: 'buffer_half_day',
      value: 'true',
      type: 'boolean',
      description: 'Aplicar buffer de medio día para limpieza',
    },
    {
      key: 'max_child_age',
      value: '10',
      type: 'integer',
      description: 'Edad máxima considerada como niño',
    },
    {
      key: 'timezone',
      value: 'America/Santiago',
      type: 'string',
      description: 'Zona horaria del sistema',
    },
    {
      key: 'cancellation_refundable_days',
      value: '7',
      type: 'integer',
      description: 'Días mínimos antes de la llegada para cancelación con reembolso',
    },
  ];

  for (const param of parameters) {
    await prisma.systemParameter.upsert({
      where: { key: param.key },
      update: param,
      create: param,
    });
  }

  console.log('✅ System parameters created');
  console.log('🌱 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
