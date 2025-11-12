import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// ============================================
// CUSTOM ERROR CLASSES
// ============================================

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(
    public message: string,
    public errors?: Record<string, string[]>
  ) {
    super(400, message);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(public message: string = 'Resource not found') {
    super(404, message);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(public message: string = 'Unauthorized') {
    super(401, message);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ForbiddenError extends AppError {
  constructor(public message: string = 'Forbidden') {
    super(403, message);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export class ConflictError extends AppError {
  constructor(public message: string = 'Resource conflict') {
    super(409, message);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

// ============================================
// ERROR HANDLER MIDDLEWARE
// ============================================

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  // Log error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      ...(err instanceof ValidationError && { errors: err.errors }),
    });
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    // @ts-ignore
    const code = err.code;

    if (code === 'P2002') {
      return res.status(409).json({
        message: 'A record with this data already exists',
      });
    }

    if (code === 'P2025') {
      return res.status(404).json({
        message: 'Record not found',
      });
    }

    if (code === 'P2003') {
      return res.status(400).json({
        message: 'Invalid foreign key reference',
      });
    }

    // Exclusion constraint (overlap)
    if (code === 'P2034') {
      return res.status(409).json({
        message: 'The selected dates overlap with an existing confirmed reservation',
      });
    }
  }

  // Handle validation errors from class-validator
  if (Array.isArray((err as any).errors)) {
    const validationErrors: Record<string, string[]> = {};

    (err as any).errors.forEach((error: any) => {
      if (error.constraints) {
        validationErrors[error.property] = Object.values(error.constraints);
      }
    });

    return res.status(400).json({
      message: 'Validation failed',
      errors: validationErrors,
    });
  }

  // Default error
  const statusCode = (err as any).statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message || 'Internal Server Error';

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
