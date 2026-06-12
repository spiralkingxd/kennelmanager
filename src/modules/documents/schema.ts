import { z } from 'zod';

export const DOCUMENT_TYPES = [
  'PEDIGREE', 'CERTIFICATE', 'EXAM_REPORT', 'PURCHASE_CONTRACT',
  'SALE_CONTRACT', 'PHOTO', 'OTHER',
] as const;

const safeFilePath = z.string().min(1, 'Caminho do arquivo é obrigatório')
  .refine(val => {
    const lower = val.toLowerCase().trim();
    // H-1: Reject javascript:, data: and other non-HTTP protocols
    if (lower.startsWith('javascript:') || lower.startsWith('data:')) return false;
    return true;
  }, 'Caminho de arquivo inválido — protocolo não permitido')
  .refine(val => {
    // Path traversal protection: reject '../'
    return !val.includes('..');
  }, 'Caminho de arquivo inválido — path traversal detectado');

export const createDocumentSchema = z.object({
  animalId: z.string().uuid().optional().nullable(),
  clientId: z.string().uuid().optional().nullable(),
  type: z.enum(DOCUMENT_TYPES).default('OTHER'),
  name: z.string().min(1, 'Nome do documento é obrigatório').max(255),
  filePath: safeFilePath,
  fileSize: z.number().int().positive().optional().nullable(),
  mimeType: z.string().max(100).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
}).strict();
export const updateDocumentSchema = createDocumentSchema.partial();
