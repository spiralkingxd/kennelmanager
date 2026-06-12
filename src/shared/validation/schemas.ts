import { z } from 'zod';

export const emailSchema = z.string().min(1, 'Email obrigatório').email('Email inválido');

export const nameSchema = z.string().min(1, 'Nome obrigatório').max(100, 'Máximo 100 caracteres');

export const passwordSchema = z.string()
  .min(8, 'Mínimo 8 caracteres')
  .regex(/[A-Z]/, 'Deve conter letra maiúscula')
  .regex(/[a-z]/, 'Deve conter letra minúscula')
  .regex(/[0-9]/, 'Deve conter número');

export const optionalEmailSchema = z
  .string()
  .refine(
    (v) => v === '' || z.string().email().safeParse(v).success,
    'Email inválido'
  );

export const phoneSchema = z
  .string()
  .refine(
    (v) => v === '' || /^[\d\s\-()]+$/.test(v),
    'Telefone inválido'
  );

export const positiveNumberString = (message: string) =>
  z.string().refine(
    (v) => v === '' || (!isNaN(parseFloat(v)) && parseFloat(v) > 0),
    message
  );

export const positiveNumberOrEmpty = (message: string) =>
  z.string().refine(
    (v) => v === '' || (!isNaN(parseFloat(v)) && parseFloat(v) >= 0),
    message
  );

export const uuidSchema = z.string().uuid('ID inválido');

export const requiredSelectSchema = (message: string) =>
  z.string().min(1, message);
