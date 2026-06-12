import { z } from 'zod';
export const createFinancialSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.enum(['FOOD', 'VET', 'VACCINES', 'EXAMS', 'MEDICATION', 'REPRODUCTION', 'EXHIBITION', 'INFRASTRUCTURE', 'MARKETING', 'LABOR', 'OTHER']).optional().nullable(),
  amount: z.number().positive().max(9999999999.99, 'Valor máximo é R$ 99.999.999,99'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  description: z.string().max(2000).optional().nullable(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD').optional().nullable(),
  paidDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD').optional().nullable(),
  receiptUrl: z.string().max(500).optional().nullable(),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']).optional().nullable(),
  paymentMethod: z.string().max(50).optional().nullable(),
  clientId: z.string().max(50).optional().nullable(),
  puppyId: z.string().max(50).optional().nullable(),
  animalId: z.string().max(50).optional().nullable(),
}).strict();
export const updateFinancialSchema = createFinancialSchema.partial();

export const queryFinancialSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  clientId: z.string().uuid().optional(),
  animalId: z.string().uuid().optional(),
  litterId: z.string().uuid().optional(),
});
