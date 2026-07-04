import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const jwtPayloadSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  role: z.enum(['ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL', 'READONLY']),
});

/**
 * Parse a named cookie from the Cookie header (same pattern as csrf.ts;
 * the project deliberately avoids the cookie-parser dependency).
 */
function getCookie(req: Request, name: string): string | undefined {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return undefined;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${escaped}=([^;]*)`));
  return match?.[1];
}

/**
 * Middleware de autenticação JWT.
 * Extrai o token do header Authorization (Bearer) — prioridade 1 — e
 * do cookie httpOnly `kennelmanager_token` — prioridade 2 (HIGH-001).
 * Verifica a assinatura e anexa os dados do usuário (id, username, role)
 * ao req.user.
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // HIGH-001: Prefer relying on httpOnly cookie sent automatically by the browser.
  // Fall back to Authorization header for backwards compatibility (mobile/non-browser clients).
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader) {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (!token) {
    token = getCookie(req, 'kennelmanager_token');
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token de autenticação não fornecido.',
      code: 'TOKEN_MISSING',
    });
  }
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return res.status(500).json({
      success: false,
      message: 'JWT_SECRET não configurado no servidor.',
      code: 'JWT_CONFIG_ERROR',
    });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });
    const parsed = jwtPayloadSchema.safeParse(decoded);

    if (!parsed.success) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido.',
        code: 'TOKEN_INVALID',
      });
    }

    req.user = {
      id: parsed.data.id,
      username: parsed.data.username,
      role: parsed.data.role,
    };
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido.',
      code: 'TOKEN_INVALID',
    });
  }
};

/**
 * Middleware de autorização RBAC (Role-Based Access Control).
 * Verifica se o usuário autenticado possui uma das roles necessárias.
 */
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso não autorizado.',
        code: 'FORBIDDEN'
      });
    }
    next();
  };
};
