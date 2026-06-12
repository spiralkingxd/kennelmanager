import { z } from 'zod';
export const createInteractionSchema = z.object({
  clientId: z.string(),
  type: z.enum(['WHATSAPP', 'PHONE', 'EMAIL', 'VISIT', 'SOCIAL_MEDIA', 'OTHER']).optional(),
  description: z.string().max(5000),
  date: z.string().optional(),
  followUpDate: z.string().optional(),
  followUpNotes: z.string().max(2000).optional(),
});
export const updateInteractionSchema = createInteractionSchema.partial();
