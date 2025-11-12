import prisma from '../config/prisma';
import { Reservation, ReservationStatus, Prisma } from '@prisma/client';

// ============================================
// RESERVATION REPOSITORY
// Encapsula toda la lógica de acceso a datos
// ============================================

export class ReservationRepository {
  // ==========================================
  // CREATE
  // ==========================================

  async create(data: Prisma.ReservationCreateInput): Promise<Reservation> {
    return prisma.reservation.create({
      data,
      include: {
        client: true,
      },
    });
  }

  // ==========================================
  // READ
  // ==========================================

  async findById(id: number): Promise<Reservation | null> {
    return prisma.reservation.findUnique({
      where: { id },
      include: {
        client: true,
        notifications: true,
      },
    });
  }

  async findAll(params?: {
    status?: ReservationStatus;
    fromDate?: Date;
    toDate?: Date;
    page?: number;
    perPage?: number;
  }): Promise<{ data: Reservation[]; total: number }> {
    const { status, fromDate, toDate, page = 1, perPage = 15 } = params || {};

    const where: Prisma.ReservationWhereInput = {
      ...(status && { status }),
      ...(fromDate &&
        toDate && {
          OR: [
            {
              arrivalDate: {
                gte: fromDate,
                lte: toDate,
              },
            },
            {
              departureDate: {
                gte: fromDate,
                lte: toDate,
              },
            },
            {
              AND: [{ arrivalDate: { lte: fromDate } }, { departureDate: { gte: toDate } }],
            },
          ],
        }),
    };

    const [data, total] = await Promise.all([
      prisma.reservation.findMany({
        where,
        include: {
          client: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.reservation.count({ where }),
    ]);

    return { data, total };
  }

  async findConfirmedInRange(startDate: Date, endDate: Date): Promise<Reservation[]> {
    return prisma.reservation.findMany({
      where: {
        status: 'confirmed',
        OR: [
          {
            arrivalDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            departureDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            AND: [{ arrivalDate: { lte: startDate } }, { departureDate: { gte: endDate } }],
          },
        ],
      },
      include: {
        client: true,
      },
      orderBy: {
        arrivalDate: 'asc',
      },
    });
  }

  // ==========================================
  // UPDATE
  // ==========================================

  async update(id: number, data: Prisma.ReservationUpdateInput): Promise<Reservation> {
    return prisma.reservation.update({
      where: { id },
      data,
      include: {
        client: true,
      },
    });
  }

  async confirm(
    id: number,
    depositData: {
      depositAmount: number;
      depositDate: Date;
      depositMethod?: string;
      depositReference?: string;
      finalAmount?: number;
    }
  ): Promise<Reservation> {
    return prisma.reservation.update({
      where: { id },
      data: {
        status: 'confirmed',
        depositAmount: depositData.depositAmount,
        depositDate: depositData.depositDate,
        depositMethod: depositData.depositMethod,
        depositReference: depositData.depositReference,
        finalAmount: depositData.finalAmount,
      },
      include: {
        client: true,
      },
    });
  }

  async cancel(id: number, reason: string): Promise<Reservation> {
    return prisma.reservation.update({
      where: { id },
      data: {
        status: 'cancelled',
        cancellationReason: reason,
        cancelledAt: new Date(),
      },
      include: {
        client: true,
      },
    });
  }

  // ==========================================
  // DELETE
  // ==========================================

  async delete(id: number): Promise<Reservation> {
    return prisma.reservation.delete({
      where: { id },
    });
  }

  // ==========================================
  // QUERIES ESPECÍFICAS
  // ==========================================

  async checkOverlap(
    arrivalDate: Date,
    departureDate: Date,
    excludeId?: number
  ): Promise<boolean> {
    const overlapping = await prisma.reservation.findFirst({
      where: {
        status: 'confirmed',
        ...(excludeId && { id: { not: excludeId } }),
        OR: [
          {
            AND: [{ arrivalDate: { lte: departureDate } }, { departureDate: { gte: arrivalDate } }],
          },
        ],
      },
    });

    return !!overlapping;
  }

  async getUpcoming(limit: number = 10): Promise<Reservation[]> {
    return prisma.reservation.findMany({
      where: {
        arrivalDate: {
          gte: new Date(),
        },
        status: {
          in: ['requested', 'confirmed'],
        },
      },
      include: {
        client: true,
      },
      orderBy: {
        arrivalDate: 'asc',
      },
      take: limit,
    });
  }

  async getPast(limit: number = 10): Promise<Reservation[]> {
    return prisma.reservation.findMany({
      where: {
        departureDate: {
          lt: new Date(),
        },
      },
      include: {
        client: true,
      },
      orderBy: {
        departureDate: 'desc',
      },
      take: limit,
    });
  }
}

export default new ReservationRepository();
