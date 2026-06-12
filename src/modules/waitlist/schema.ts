import { z } from 'zod';
export const createWaitlistSchema = z.object({
  clientId: z.string(),
  preferredBreed: z.string().max(100).optional().nullable(),
  preferredGender: z.enum(['MALE', 'FEMALE']).optional().nullable(),
  preferredColor: z.string().max(100).optional().nullable(),
  maxPrice: z.number().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  status: z.enum(['ACTIVE', 'MATCHED', 'COMPLETED', 'EXPIRED', 'CANCELED']).optional().nullable(),
});
export const updateWaitlistSchema = createWaitlistSchema.partial();
