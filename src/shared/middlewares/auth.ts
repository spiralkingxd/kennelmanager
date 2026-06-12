import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const jwtPayloadSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL', 'READONLY']),
});

/**
 * Middleware de autenticação JWT.
 * Extrai o token do header Authorization (Bearer), verifica a assinatura
 * e anexa os dados do usuário (id, email, role) ao req.user.
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Token de autenticação não fornecido.',
      code: 'TOKEN_MISSING',
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      message: 'Formato de token inválido. Use: Bearer <token>',
      code: 'TOKEN_INVALID_FORMAT',
    });
  }

  const token = parts[1];
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
      email: parsed.data.email,
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
