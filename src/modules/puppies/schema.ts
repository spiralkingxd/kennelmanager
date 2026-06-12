import { z } from 'zod';
export const createPuppiesSchema = z.object({
  litterId: z.string().max(50),
  name: z.string().max(100).optional().nullable(),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/, 'Horário deve estar no formato HH:MM').optional().nullable(),
  sex: z.enum(['MALE', 'FEMALE']),
  color: z.string().max(50).optional().nullable(),
  weight: z.number().positive().max(999.99, 'Peso máximo é 999.99 kg').optional().nullable(),
  microchip: z.string().max(50).optional().nullable(),
  registrationNumber: z.string().max(50).optional().nullable(),
  price: z.number().positive().max(99999999.99, 'Preço máximo é R$ 99.999.999,99').optional().nullable(),
  status: z.enum(['AVAILABLE', 'RESERVED', 'SOLD', 'RETAINED', 'DEAD']).optional().nullable(),
  clientId: z.string().max(50).optional().nullable(),
  saleDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD').optional().nullable(),
  saleNotes: z.string().max(2000).optional().nullable(),
  photoUrl: z.string().max(500).optional().nullable(),
  createdBy: z.string().max(50).optional().nullable()
}).strict();
export const updatePuppiesSchema = createPuppiesSchema.partial().omit({ createdBy: true });
