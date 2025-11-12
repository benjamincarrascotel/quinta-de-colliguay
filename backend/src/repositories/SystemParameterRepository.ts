import prisma from '../config/prisma';
import { SystemParameter } from '@prisma/client';

// ============================================
// SYSTEM PARAMETER REPOSITORY
// Con caché en memoria para mejor performance
// ============================================

export class SystemParameterRepository {
  private cache: Map<string, { value: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  async get<T = any>(key: string, defaultValue?: T): Promise<T> {
    // Check cache
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.value as T;
    }

    // Fetch from database
    const parameter = await prisma.systemParameter.findUnique({
      where: { key },
    });

    if (!parameter) {
      return defaultValue as T;
    }

    const value = this.castValue(parameter.value, parameter.type);

    // Update cache
    this.cache.set(key, { value, timestamp: Date.now() });

    return value as T;
  }

  async set(key: string, value: any, type: string = 'string'): Promise<SystemParameter> {
    const parameter = await prisma.systemParameter.upsert({
      where: { key },
      update: {
        value: String(value),
        type,
      },
      create: {
        key,
        value: String(value),
        type,
      },
    });

    // Clear cache for this key
    this.cache.delete(key);

    return parameter;
  }

  async getAll(): Promise<Record<string, any>> {
    const parameters = await prisma.systemParameter.findMany();

    const result: Record<string, any> = {};

    parameters.forEach((param) => {
      result[param.key] = this.castValue(param.value, param.type);
      // Cache each parameter
      this.cache.set(param.key, {
        value: result[param.key],
        timestamp: Date.now(),
      });
    });

    return result;
  }

  clearCache(): void {
    this.cache.clear();
  }

  private castValue(value: string, type: string): any {
    switch (type) {
      case 'integer':
        return parseInt(value, 10);
      case 'boolean':
        return value === 'true';
      case 'json':
        return JSON.parse(value);
      default:
        return value;
    }
  }
}

export default new SystemParameterRepository();
