import { Request, Response, NextFunction } from 'express';
import { validate as classValidate, ValidationError as ClassValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ValidationError } from './errorHandler';

// ============================================
// VALIDATION MIDDLEWARE
// Usa class-validator para validar DTOs
// ============================================

export const validate = (dtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Transform plain object to DTO class instance
    const dtoInstance = plainToClass(dtoClass, req.body);

    // Validate
    const errors: ClassValidationError[] = await classValidate(dtoInstance, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      // Format errors
      const formattedErrors: Record<string, string[]> = {};

      errors.forEach((error) => {
        if (error.constraints) {
          formattedErrors[error.property] = Object.values(error.constraints);
        }
      });

      throw new ValidationError('Validation failed', formattedErrors);
    }

    // Replace body with validated DTO
    req.body = dtoInstance;
    next();
  };
};
