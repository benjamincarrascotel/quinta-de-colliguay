import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsDateString,
  IsOptional,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Block } from '@prisma/client';

// ============================================
// CLIENT DTO
// ============================================

export class ClientDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'El WhatsApp es obligatorio' })
  whatsapp!: string;

  @IsEmail({}, { message: 'El email no es válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'La ciudad es obligatoria' })
  city!: string;

  @IsOptional()
  @IsString()
  observations?: string;
}

// ============================================
// CREATE RESERVATION REQUEST DTO
// ============================================

export class CreateReservationDto {
  @IsDateString({}, { message: 'La fecha de llegada no es válida' })
  @IsNotEmpty({ message: 'La fecha de llegada es obligatoria' })
  arrivalDate!: string;

  @IsEnum(Block, { message: 'El bloque de llegada debe ser "morning" o "night"' })
  @IsNotEmpty({ message: 'El bloque de llegada es obligatorio' })
  arrivalBlock!: Block;

  @IsDateString({}, { message: 'La fecha de salida no es válida' })
  @IsNotEmpty({ message: 'La fecha de salida es obligatoria' })
  departureDate!: string;

  @IsEnum(Block, { message: 'El bloque de salida debe ser "morning" o "night"' })
  @IsNotEmpty({ message: 'El bloque de salida es obligatorio' })
  departureBlock!: Block;

  @IsInt({ message: 'El número de adultos debe ser un entero' })
  @Min(1, { message: 'Debe haber al menos 1 adulto' })
  @Max(100, { message: 'El número de adultos es demasiado alto' })
  adults!: number;

  @IsInt({ message: 'El número de niños debe ser un entero' })
  @Min(0, { message: 'El número de niños no puede ser negativo' })
  @Max(100, { message: 'El número de niños es demasiado alto' })
  @IsOptional()
  children?: number;

  @ValidateNested()
  @Type(() => ClientDto)
  client!: ClientDto;

  @IsNumber({}, { message: 'El monto estimado debe ser un número' })
  @Min(0, { message: 'El monto estimado no puede ser negativo' })
  estimatedAmount!: number;
}

// ============================================
// UPDATE RESERVATION DTO
// ============================================

export class UpdateReservationDto {
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de llegada no es válida' })
  arrivalDate?: string;

  @IsOptional()
  @IsEnum(Block, { message: 'El bloque de llegada debe ser "morning" o "night"' })
  arrivalBlock?: Block;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de salida no es válida' })
  departureDate?: string;

  @IsOptional()
  @IsEnum(Block, { message: 'El bloque de salida debe ser "morning" o "night"' })
  departureBlock?: Block;

  @IsOptional()
  @IsInt({ message: 'El número de adultos debe ser un entero' })
  @Min(1, { message: 'Debe haber al menos 1 adulto' })
  adults?: number;

  @IsOptional()
  @IsInt({ message: 'El número de niños debe ser un entero' })
  @Min(0, { message: 'El número de niños no puede ser negativo' })
  children?: number;

  @IsOptional()
  @IsString()
  clientObservations?: string;

  @IsOptional()
  @IsString()
  adminObservations?: string;
}

// ============================================
// CONFIRM RESERVATION DTO
// ============================================

export class ConfirmReservationDto {
  @IsNumber({}, { message: 'El monto del anticipo debe ser un número' })
  @Min(0, { message: 'El monto del anticipo no puede ser negativo' })
  depositAmount!: number;

  @IsDateString({}, { message: 'La fecha del anticipo no es válida' })
  @IsNotEmpty({ message: 'La fecha del anticipo es obligatoria' })
  depositDate!: string;

  @IsOptional()
  @IsString()
  depositMethod?: string;

  @IsOptional()
  @IsString()
  depositReference?: string;

  @IsOptional()
  @IsNumber({}, { message: 'El monto final debe ser un número' })
  @Min(0, { message: 'El monto final no puede ser negativo' })
  finalAmount?: number;
}

// ============================================
// CANCEL RESERVATION DTO
// ============================================

export class CancelReservationDto {
  @IsString()
  @IsNotEmpty({ message: 'El motivo de cancelación es obligatorio' })
  reason!: string;
}
