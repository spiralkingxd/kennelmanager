import { Request } from 'express';

/**
 * Retorna o userId para filtro de isolamento de dados.
 * Para usuários ADMIN, retorna undefined (sem filtro — vê todos os dados).
 * Para outros usuários, retorna seu ID (filtrado — vê apenas seus dados).
 */
export function isolationUserId(req: Request): string | undefined {
  return req.user?.role === 'ADMIN' ? undefined : req.user?.id;
}
