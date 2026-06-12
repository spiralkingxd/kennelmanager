import { z } from 'zod';

const passwordSchema = z.string()
  .min(8, 'A senha deve ter no mínimo 8 caracteres')
  .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
  .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
  .regex(/[0-9]/, 'A senha deve conter pelo menos um número');

const roleEnum = z.enum(['ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL', 'READONLY']);
const statusEnum = z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED']);

export const createUsersSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: passwordSchema,
  phone: z.string().optional(),
  role: roleEnum.optional(),
  status: statusEnum.optional(),
});

export const updateUsersSchema = createUsersSchema.partial().omit({ role: true });
