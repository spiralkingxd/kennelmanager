import { z } from 'zod';

export const createAuditLogSchema = z.object({
  userId: z.string().uuid(),
  action: z.enum(['CREATED', 'UPDATED', 'DELETED', 'VIEWED', 'LOGIN', 'LOGOUT', 'PASSWORD_RESET']),
  entityType: z.string().max(100),
  entityId: z.string().uuid().optional(),
  oldValues: z.unknown().optional(),
  newValues: z.unknown().optional(),
  ipAddress: z.string().max(100).optional(),
  userAgent: z.string().max(500).optional(),
});

export const queryAuditLogSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  entityType: z.string().optional(),
  action: z.enum(['CREATED', 'UPDATED', 'DELETED', 'VIEWED', 'LOGIN', 'LOGOUT', 'PASSWORD_RESET']).optional(),
  userId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
