import { z } from 'zod';
export const createClientsSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  email: z.string().email().max(254).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  secondaryPhone: z.string().max(20).optional().nullable(),
  address: z.string().max(255).optional().nullable(),
  city: z.string().max(255).optional().nullable(),
  state: z.string().max(255).optional().nullable(),
  zipCode: z.string().max(255).optional().nullable(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD').optional().nullable(),
  profession: z.string().max(200).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  howFoundUs: z.string().max(200).optional().nullable(),
}).strict();
export const updateClientsSchema = createClientsSchema.partial();
export const bulkIdsSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, 'Selecione ao menos um cliente'),
});
