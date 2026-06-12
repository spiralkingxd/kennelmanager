import { z } from 'zod';

// ─── Enums ───────────────────────────────────────────────────────────────────
export const EXAM_TYPES = [
  'BLOOD_TEST', 'XRAY', 'ULTRASOUND', 'PROGESTERONE', 'OFA',
  'BRUCELLOSIS', 'HIP_DYSPLASIA', 'ELBOW_DYSPLASIA', 'OTHER',
] as const;

export const MEDICATION_STATUS = ['ACTIVE', 'COMPLETED', 'CANCELED', 'SUSPENDED'] as const;

export const INSEMINATION_TYPES = ['NATURAL', 'ARTIFICIAL_FRESH', 'ARTIFICIAL_REFRIGERATED', 'ARTIFICIAL_FROZEN'] as const;

// ─── Vaccines ────────────────────────────────────────────────────────────────
export const createVaccineSchema = z.object({
  animalId: z.string().uuid().max(50),
  name: z.string().min(1, 'Nome da vacina é obrigatório').max(100),
  manufacturer: z.string().max(100).optional().nullable(),
  batch: z.string().max(50).optional().nullable(),
  dose: z.string().max(50).optional().nullable(),
  date: z.string().min(1, 'Data é obrigatória').regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  nextDueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD').optional().nullable(),
  vetName: z.string().max(100).optional().nullable(),
  clinic: z.string().max(100).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
}).strict();
export const updateVaccineSchema = createVaccineSchema.partial().omit({ animalId: true });

// ─── Deworming ───────────────────────────────────────────────────────────────
export const createDewormingSchema = z.object({
  animalId: z.string().uuid().max(50),
  product: z.string().min(1, 'Produto é obrigatório').max(100),
  activeIngredient: z.string().max(100).optional().nullable(),
  dose: z.string().max(50).optional().nullable(),
  weightAtDate: z.number().positive().max(999.99, 'Peso máximo é 999.99 kg').optional().nullable(),
  date: z.string().min(1, 'Data é obrigatória').regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  nextDueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD').optional().nullable(),
  vetName: z.string().max(100).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
}).strict();
export const updateDewormingSchema = createDewormingSchema.partial().omit({ animalId: true });

const safeUrl = z.string().max(500).optional().nullable()
  .refine(val => {
    if (!val) return true;
    const lower = val.toLowerCase().trim();
    // H-2: Reject javascript:, data: and other non-HTTP protocols
    if (lower.startsWith('javascript:') || lower.startsWith('data:')) return false;
    return true;
  }, 'URL inválida — protocolo não permitido');

// ─── Exams ───────────────────────────────────────────────────────────────────
export const createExamSchema = z.object({
  animalId: z.string().uuid().max(50),
  type: z.enum(EXAM_TYPES),
  date: z.string().min(1, 'Data é obrigatória').regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  result: z.string().max(2000).optional().nullable(),
  resultFileUrl: safeUrl,
  vetName: z.string().max(100).optional().nullable(),
  clinic: z.string().max(100).optional().nullable(),
  isPreReproduction: z.boolean().optional().default(false),
  notes: z.string().max(2000).optional().nullable(),
}).strict();
export const updateExamSchema = createExamSchema.partial().omit({ animalId: true });

// ─── Consultations ───────────────────────────────────────────────────────────
export const createConsultationSchema = z.object({
  animalId: z.string().uuid().max(50),
  date: z.string().min(1, 'Data é obrigatória').regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  reason: z.string().min(1, 'Motivo é obrigatório').max(1000),
  diagnosis: z.string().max(2000).optional().nullable(),
  treatment: z.string().max(2000).optional().nullable(),
  medications: z.string().max(2000).optional().nullable(),
  value: z.number().positive().optional().nullable(),
  vetName: z.string().max(100).optional().nullable(),
  clinic: z.string().max(100).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
}).strict();
export const updateConsultationSchema = createConsultationSchema.partial().omit({ animalId: true });

// ─── Medications ─────────────────────────────────────────────────────────────
export const createMedicationSchema = z.object({
  animalId: z.string().uuid().max(50),
  name: z.string().min(1, 'Nome do medicamento é obrigatório').max(100),
  dose: z.string().max(50).optional().nullable(),
  route: z.string().max(50).optional().nullable(),
  frequency: z.string().max(50).optional().nullable(),
  startDate: z.string().min(1, 'Data de início é obrigatória').regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD').optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  status: z.enum(MEDICATION_STATUS).optional().default('ACTIVE'),
}).strict();
export const updateMedicationSchema = createMedicationSchema.partial().omit({ animalId: true });

// ─── Weight History ──────────────────────────────────────────────────────────
export const createWeightSchema = z.object({
  animalId: z.string().uuid().max(50),
  weight: z.number().positive('Peso deve ser positivo').max(999.99, 'Peso máximo é 999.99 kg'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD').optional(),
  notes: z.string().max(2000).optional().nullable(),
}).strict();
export const updateWeightSchema = createWeightSchema.partial().omit({ animalId: true });

// ─── Heat Cycles ─────────────────────────────────────────────────────────────
export const createHeatCycleSchema = z.object({
  animalId: z.string().uuid().max(50),
  startDate: z.string().min(1, 'Data de início é obrigatória').regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD').optional().nullable(),
  intensity: z.string().max(50).optional().nullable(),
  wasMated: z.boolean().optional().default(false),
  notes: z.string().max(2000).optional().nullable(),
}).strict();
export const updateHeatCycleSchema = createHeatCycleSchema.partial().omit({ animalId: true });

// ─── Matings ─────────────────────────────────────────────────────────────────
export const createMatingSchema = z.object({
  femaleId: z.string().uuid().max(50),
  maleId: z.string().uuid().max(50),
  type: z.enum(INSEMINATION_TYPES).optional().default('NATURAL'),
  date: z.string().min(1, 'Data é obrigatória').regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  result: z.string().max(2000).optional().nullable(),
  litterId: z.string().uuid().max(50).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
}).strict();
export const updateMatingSchema = createMatingSchema.partial().omit({ femaleId: true, maleId: true });

// ─── Gestations ──────────────────────────────────────────────────────────────
export const createGestationSchema = z.object({
  animalId: z.string().uuid().max(50),
  matingId: z.string().uuid().max(50).optional().nullable(),
  startDate: z.string().min(1, 'Data de início é obrigatória').regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  expectedBirthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD').optional().nullable(),
  actualBirthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD').optional().nullable(),
  estimatedPuppies: z.number().int().positive().optional().nullable(),
  progressWeek: z.number().int().min(0).max(9).optional().default(0),
  isActive: z.boolean().optional().default(true),
  notes: z.string().max(2000).optional().nullable(),
}).strict();
export const updateGestationSchema = createGestationSchema.partial().omit({ animalId: true }).extend({
  litterId: z.string().uuid().max(50).optional().nullable(),
});
