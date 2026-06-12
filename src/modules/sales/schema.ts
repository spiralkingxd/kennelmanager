import { z } from 'zod';

export const createSaleSchema = z.object({
  clientId: z.string().max(50),
  puppyId: z.string().max(50).optional().nullable(),
  status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED']).optional().nullable(),
  condition: z.enum(['CASH', 'ENTRY_PLUS_BALANCE', 'INSTALLMENTS']).optional().nullable(),
  entryValue: z.number().positive().optional().nullable(),
  totalValue: z.number().positive().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
}).strict();

export const updateSaleSchema = createSaleSchema.partial();

export const querySalesSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(1000).optional().default(20),
});
