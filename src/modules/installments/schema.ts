import { z } from 'zod';

export const createInstallmentSchema = z.object({
  transactionId: z.string().uuid(),
  installmentNumber: z.number().int().positive(),
  amount: z.number().positive().max(9999999999.99, 'Valor máximo é R$ 99.999.999,99'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  paidDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD').optional().nullable(),
  paidAmount: z.number().positive().max(9999999999.99).optional().nullable(),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE']).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const updateInstallmentSchema = createInstallmentSchema.partial();

export const queryInstallmentSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  transactionId: z.string().uuid().optional(),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE']).optional(),
});
