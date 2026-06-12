import { z } from 'zod';
const litterFields = {
  motherId: z.string().max(50),
  fatherId: z.string().max(50),
  expectedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD').optional().nullable(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD').optional().nullable(),
  status: z.enum(['PLANNED', 'CONFIRMED', 'BORN', 'WEANING', 'COMPLETED', 'CANCELED']).optional().nullable(),
  birthType: z.enum(['NATURAL', 'CESAREAN']).optional().nullable(),
  totalPuppies: z.number().optional().nullable(),
  maleCount: z.number().optional().nullable(),
  femaleCount: z.number().optional().nullable(),
  notes: z.string().max(2000).optional().nullable()
};

export const createLittersSchema = z.object(litterFields).strict()
  .refine(data => data.motherId !== data.fatherId, {
    message: 'Mãe e pai não podem ser o mesmo animal',
  });

export const updateLittersSchema = z.object({
  motherId: litterFields.motherId.optional(),
  fatherId: litterFields.fatherId.optional(),
  expectedDate: litterFields.expectedDate,
  birthDate: litterFields.birthDate,
  status: litterFields.status,
  birthType: litterFields.birthType,
  totalPuppies: litterFields.totalPuppies,
  maleCount: litterFields.maleCount,
  femaleCount: litterFields.femaleCount,
  notes: litterFields.notes,
}).strict();
