import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// ============================================
// REQUEST LOGGER MIDDLEWARE
// ============================================

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Log request
  logger.info(`→ ${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? 'warn' : 'info';

    logger[level](`← ${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
  });

  next();
};
