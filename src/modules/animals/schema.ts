import { z } from 'zod';

export const ANIMAL_SEX = ['MALE', 'FEMALE'] as const;
export const ANIMAL_STATUS = ['ACTIVE', 'INACTIVE', 'DECEASED', 'SOLD'] as const;
export const ANIMAL_SIZE = ['SMALL', 'MEDIUM', 'LARGE', 'GIANT'] as const;
export const TEMPERAMENT_TAGS = ['DOCILE', 'PLAYFUL', 'RESERVED', 'PROTECTIVE', 'ENERGETIC', 'CALM', 'DOMINANT', 'SOCIABLE', 'INDEPENDENT'] as const;

/** Valida se uma string opcional é uma data ISO parseável ou vazia/null */
const dateOrNull = () =>
  z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (val === null || val === undefined || val === '') return true;
        return !isNaN(new Date(val).getTime());
      },
      { message: 'Data inválida. Use o formato DD/MM/AAAA.' },
    );

export const createAnimalsSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  breed: z.string().min(1, 'Raça é obrigatória').max(50),
  sex: z.enum(ANIMAL_SEX),
  size: z.enum(ANIMAL_SIZE).optional().nullable(),
  color: z.string().max(50).optional().nullable(),
  weight: z.number().positive().max(999.99, 'Peso máximo é 999.99 kg').optional().nullable(),
  birthDate: dateOrNull(),
  deathDate: dateOrNull(),
  microchip: z.string().max(50).optional().nullable(),
  registrationNumber: z.string().max(50).optional().nullable(),
  pedigreeNumber: z.string().max(50).optional().nullable(),
  status: z.enum(ANIMAL_STATUS).optional().nullable(),
  isAvailableForBreeding: z.boolean().optional().default(true),
  temperament: z.array(z.enum(TEMPERAMENT_TAGS)).optional().nullable(),
  origin: z.string().max(100).optional().nullable(),
  breeder: z.string().max(100).optional().nullable(),
  purchaseDate: dateOrNull(),
  purchasePrice: z.number().positive().max(99999999.99, 'Preço máximo é R$ 99.999.999,99').optional().nullable(),
  photoUrl: z.string().url().max(500).optional().or(z.literal('')),
  notes: z.string().max(2000).optional().nullable(),
  fatherId: z.string().uuid().max(50).optional().nullable(),
  motherId: z.string().uuid().max(50).optional().nullable(),
  ownerId: z.string().uuid().max(50).optional().nullable(),
}).strict();
export const updateAnimalsSchema = createAnimalsSchema.partial();
