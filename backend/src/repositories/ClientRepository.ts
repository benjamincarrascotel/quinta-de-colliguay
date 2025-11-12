import prisma from '../config/prisma';
import { Client, Prisma } from '@prisma/client';

// ============================================
// CLIENT REPOSITORY
// ============================================

export class ClientRepository {
  async create(data: Prisma.ClientCreateInput): Promise<Client> {
    return prisma.client.create({
      data,
    });
  }

  async findById(id: number): Promise<Client | null> {
    return prisma.client.findUnique({
      where: { id },
      include: {
        reservations: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }

  async findByEmail(email: string): Promise<Client | null> {
    return prisma.client.findFirst({
      where: { email },
    });
  }

  async findByWhatsApp(whatsapp: string): Promise<Client | null> {
    return prisma.client.findFirst({
      where: { whatsapp },
    });
  }

  async findOrCreate(data: Prisma.ClientCreateInput): Promise<Client> {
    // Try to find by email first
    let client = await this.findByEmail(data.email);

    if (!client) {
      // Try by whatsapp
      client = await this.findByWhatsApp(data.whatsapp);
    }

    if (!client) {
      // Create new client
      client = await this.create(data);
    }

    return client;
  }

  async search(query: string): Promise<Client[]> {
    return prisma.client.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { whatsapp: { contains: query } },
        ],
      },
      include: {
        reservations: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
      },
    });
  }

  async update(id: number, data: Prisma.ClientUpdateInput): Promise<Client> {
    return prisma.client.update({
      where: { id },
      data,
    });
  }
}

export default new ClientRepository();
