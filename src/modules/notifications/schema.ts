// src/modules/notifications/schema.ts
// Schemas Zod para o módulo de notificações. Tipos espelham o schema.sql
// (notification_type enum + colunas: title, description, reference_type,
// reference_id, is_read, read_at, created_at).
import { z } from 'zod';

// Enums espelhando o `notification_type` do schema.sql
export const notificationTypeSchema = z.enum([
  'HEALTH_ALERT',
  'REPRODUCTION_ALERT',
  'FINANCIAL_ALERT',
  'SALES_ALERT',
  'WAITLIST_MATCH',
  'SYSTEM',
]);
export type NotificationType = z.infer<typeof notificationTypeSchema>;

export const createNotificationSchema = z.object({
  userId: z.string().uuid('userId inválido'),
  type: notificationTypeSchema,
  title: z.string().min(1, 'Título é obrigatório').max(200),
  description: z.string().min(1, 'Descrição é obrigatória').max(2000).optional(),
  referenceType: z.string().max(50).optional(),
  referenceId: z.string().uuid().optional(),
});
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;

export const queryNotificationSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  type: notificationTypeSchema.optional(),
  unreadOnly: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((v) => v === true || v === 'true')
    .optional(),
});
export type QueryNotificationInput = z.infer<typeof queryNotificationSchema>;
