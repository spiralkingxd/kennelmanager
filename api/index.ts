// Vercel Serverless Function Entry
// TypeScript — @vercel/node compila com esbuild.
// Exporta handler padrão no lugar de app.listen().
// Alternativa robusta a api/index.cjs (extensão .cjs ignorada pelo Vercel).

import { configureApp, runStartupTasks } from '../src/expressApp';
import type { Application } from 'express';

let cachedApp: Application | null = null;

export default async function handler(req: any, res: any) {
  if (!cachedApp) {
    try {
      // Validação manual das env vars essenciais (sem throw em produção)
      const required = ['DATABASE_URL', 'JWT_SECRET'];
      const missing = required.filter(key => !process.env[key]);
      if (missing.length > 0) {
        console.error('[VERCEL] Missing required env vars:', missing.join(', '));
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({
          success: false,
          message: 'Server configuration error.',
          code: 'MISSING_ENV',
        }));
      }

      cachedApp = configureApp();

      // Background tasks — fire-and-forget, nunca bloqueia a resposta
      runStartupTasks().catch((err: Error) => {
        console.error('[VERCEL] Background tasks failed:', err?.message || err);
      });
    } catch (err: any) {
      console.error('[VERCEL] Startup failed:', err?.message || err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        success: false,
        message: 'Server configuration error. Check environment variables and logs.',
        code: 'VERCEL_CONFIG_ERROR',
      }));
    }
  }

  cachedApp(req, res);
}
