import { z } from 'zod';

export const createMessageTemplateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  subject: z.string().max(200).optional().nullable(),
  body: z.string().min(1, 'Corpo é obrigatório'),
  category: z.string().max(100).optional().nullable(),
  variables: z.array(z.string()).optional().nullable(),
  isActive: z.boolean().optional().nullable(),
});

export const updateMessageTemplateSchema = createMessageTemplateSchema.partial();

export const queryMessageTemplateSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  category: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});
