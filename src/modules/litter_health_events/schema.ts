// src/modules/litter_health_events/schema.ts
import { z } from 'zod';

export const createLitterHealthEventSchema = z.object({
  litterId: z.string().uuid('litterId inválido'),
  type: z.enum(['VACCINE', 'DEWORMING', 'OTHER']),
  name: z.string().min(1, 'Nome é obrigatório').max(200),
  manufacturer: z.string().max(200).optional().nullable(),
  dose: z.string().max(100).optional().nullable(),
  date: z.string().min(1, 'Data é obrigatória'),
  nextDueDate: z.string().optional().nullable(),
  amount: z.number().positive('Valor deve ser maior que zero').optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const updateLitterHealthEventSchema = createLitterHealthEventSchema
  .partial()
  .omit({ litterId: true });

export type CreateLitterHealthEventInput = z.infer<typeof createLitterHealthEventSchema>;
export type UpdateLitterHealthEventInput = z.infer<typeof updateLitterHealthEventSchema>;
