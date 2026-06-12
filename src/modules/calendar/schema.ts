import { z } from 'zod';

export const CALENDAR_CATEGORIES = ['HEALTH', 'REPRODUCTION', 'LITTER', 'FINANCIAL', 'VISIT', 'EXHIBITION', 'MANUAL'] as const;

export const createCalendarSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  date: z.string().min(1, 'Data é obrigatória'),
  time: z.string().max(10).optional().nullable(),
  endTime: z.string().max(10).optional().nullable(),
  category: z.enum(CALENDAR_CATEGORIES),
  description: z.string().max(2000).optional().nullable(),
  color: z.string().max(20).optional().nullable(),
  isAutomatic: z.boolean().optional().nullable(),
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELED']).optional().nullable(),
  animalId: z.string().uuid().optional().nullable(),
  clientId: z.string().uuid().optional().nullable(),
});
export const updateCalendarSchema = createCalendarSchema.partial();
