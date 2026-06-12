// src/shared/middlewares/audit.ts
import { Request, Response, NextFunction } from 'express';
import { AuditLogService } from '../../modules/audit_log/service';
import { logger } from '../../config/winston';
import { SENSITIVE_KEYS } from '../utils/redact';
import { pool } from '../config/db';

// Singleton — stateless service, safe to share across requests
const auditService = new AuditLogService();

const SKIP_METHODS = new Set(['GET', 'HEAD', 'OPTIONS', 'PATCH']);

const SKIP_PATH_PREFIXES = [
  '/api/v1/auth/',
  '/api/v1/audit',
  '/api/v1/system-config',
  '/api/health',
];

/**
 * Redact sensitive fields in an object recursively using the SENSITIVE_KEYS regex
 * from src/shared/utils/redact.ts (shared with the winston logger pipeline).
 * Replaces any key matching the regex with '[REDACTED]'.
 */
function redactSensitive(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(redactSensitive);
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      SENSITIVE_KEYS.test(key) ? '[REDACTED]' : redactSensitive(value)
    ])
  );
}

type AuditAction = 'CREATED' | 'UPDATED' | 'DELETED';

function getAction(method: string): AuditAction | null {
  switch (method) {
    case 'POST':
      return 'CREATED';
    case 'PUT':
      return 'UPDATED';
    case 'DELETE':
      return 'DELETED';
    default:
      return null;
  }
}

/**
 * Parse the request URL to extract the entity type and ID.
 *
 * Examples:
 *   /api/v1/users              -> { entityType: 'user',  entityId: null }
 *   /api/v1/users/abc-123-uuid -> { entityType: 'user',  entityId: 'abc-123-uuid' }
 *   /api/v1/litter-health-events/abc -> { entityType: 'litter-health-event', entityId: 'abc' }
 *
 * Note: req.params is not yet populated at the app-level middleware
 * (params are set by the route handler in the sub-router), so we parse
 * the URL manually from req.originalUrl.
 */
function getEntityTypeAndId(originalUrl: string): { entityType: string; entityId: string | null } {
  const pathOnly = originalUrl.split('?')[0];
  const parts = pathOnly.split('/').filter(Boolean);

  // Expected: ['api', 'v1', '<entity>', '<id>?']
  if (parts.length < 3) return { entityType: '', entityId: null };

  const raw = parts[2];
  const entityType = raw.endsWith('s') ? raw.slice(0, -1) : raw;
  const entityId = parts[3] ?? null;

  return { entityType, entityId };
}

function getIpAddress(req: Request): string | null {
  const xff = req.headers['x-forwarded-for'];
  if (req.ip) return req.ip;
  if (typeof xff === 'string') return xff;
  if (Array.isArray(xff) && xff.length > 0) return xff[0];
  return null;
}

const entityTableMap: Record<string, string> = {
  'animal': 'animals',
  'client': 'clients',
  'financial': 'financial_transactions',
  'litter': 'litters',
  'puppy': 'puppies',
  'sale': 'sales',
  'document': 'documents',
  'vaccine': 'vaccines',
  'deworming': 'dewormings',
  'exam': 'exams',
  'consultation': 'consultations',
  'medication': 'medications',
  'weight': 'weight_history',
  'heat-cycle': 'heat_cycles',
  'mating': 'matings',
  'gestation': 'gestations',
  'user': 'users',
  'installment': 'installments',
  'message-template': 'message_templates',
  'system-config': 'system_config',
  'client-interaction': 'client_interactions',
  'calendar-event': 'calendar_events',
  'waitlist-entry': 'waitlist',
  'litter-health-event': 'litter_health_events',
};

async function fetchOldValues(entityType: string, entityId: string): Promise<any> {
  const tableName = entityTableMap[entityType];
  if (!tableName) return null;

  try {
    const res = await pool.query(`SELECT * FROM ${tableName} WHERE id = $1`, [entityId]);
    return res.rows[0] || null;
  } catch (err) {
    logger.warn('Audit middleware: could not fetch old values', {
      entityType,
      entityId,
      error: (err as Error).message,
    });
    return null;
  }
}

/**
 * Middleware de auditoria automática.
 *
 * Captura toda requisição mutante (POST/PUT/DELETE) autenticada e persiste
 * um registro em `audit_log` após a resposta ser enviada. Em caso de falha
 * no log, a requisição original NÃO é afetada (fail-open).
 *
 * Requisitos:
 * - LGPD: registro automático de operações sensíveis
 * - Paths excluídos: /api/v1/auth/*, /api/v1/audit (evita loop), /api/v1/system-config
 * - Métodos excluídos: GET, HEAD, OPTIONS, PATCH (read-only)
 * - Requer req.user preenchido (authMiddleware deve rodar antes)
 */
export const auditMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // 1. Skip non-mutating methods
  if (SKIP_METHODS.has(req.method)) {
    return next();
  }

  // Use originalUrl because req.path is rewritten by app.use to be relative
  // to the mount point (e.g., '/users/123' instead of '/api/v1/users/123').
  const fullPath = req.originalUrl.split('?')[0];

  // 2. Skip excluded paths (auth, audit itself, system-config, health)
  for (const prefix of SKIP_PATH_PREFIXES) {
    if (fullPath.startsWith(prefix)) {
      return next();
    }
  }

  // 3. Skip if not authenticated
  if (!req.user) {
    return next();
  }

  // 4. Resolve action — only POST/PUT/DELETE are tracked
  const action = getAction(req.method);
  if (!action) {
    return next();
  }

  // 5. Extract entity type and id from URL
  const { entityType, entityId } = getEntityTypeAndId(fullPath);
  const userAgent =
    typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : null;
  const ipAddress = getIpAddress(req);

  // 6. Fetch old values from DB for PUT and DELETE (before mutation)
  let oldValues: unknown = null;
  if ((action === 'UPDATED' || action === 'DELETED') && entityId && entityType) {
    oldValues = await fetchOldValues(entityType, entityId);
  }

  // 7. Snapshot body BEFORE the request is processed (so we capture what
  // the client actually sent, not what the controller mutated).
  let bodySnapshot: unknown = null;
  if (req.body !== undefined && req.body !== null) {
    try {
      bodySnapshot = JSON.parse(JSON.stringify(req.body));
    } catch (err) {
      // Circular references or non-serializable — log raw structure metadata only
      logger.warn('Audit middleware: could not serialize request body', {
        path: fullPath,
        method: req.method,
        error: (err as Error).message,
      });
      bodySnapshot = null;
    }
  }

  // 8. After the response is sent, persist the audit log (fire-and-forget)
  res.on('finish', () => {
    // Only log successful operations
    if (res.statusCode < 200 || res.statusCode >= 300) {
      return;
    }

    auditService
      .create({
        userId: req.user!.id,
        action,
        entityType,
        entityId,
        oldValues: oldValues !== null ? redactSensitive(oldValues) : null,
        newValues: bodySnapshot !== null ? redactSensitive(bodySnapshot) : null,
        ipAddress,
        userAgent,
      })
      .catch((err: Error) => {
        // Fail-open: never break the request
        logger.error('Audit middleware: failed to persist audit log', {
          path: fullPath,
          method: req.method,
          userId: req.user?.id,
          action,
          error: err.message,
        });
      });
  });

  next();
};
