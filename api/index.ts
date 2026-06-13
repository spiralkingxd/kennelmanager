// Vercel Serverless Entry Point
// Uses dynamic imports to avoid module-level crashes (db.ts Pool, router imports)
// All module loading is deferred to first request, errors caught by try/catch

import type { Request, Response } from 'express';

let app: any = null;

export default async function handler(req: Request, res: Response) {
  try {
    if (!app) {
      // Ensure NODE_ENV (Vercel may not set it explicitly)
      if (!process.env.NODE_ENV) {
        process.env.NODE_ENV = 'production';
      }

      // Dynamic import: all module loading deferred until first request
      // This prevents crashes from db.ts, winston.ts, swagger.ts at module load time
      const { configureApp, validateRequiredEnv, runStartupTasks } = await import(
        '../src/expressApp'
      );

      validateRequiredEnv();
      app = configureApp();

      // Startup tasks run in background (fire-and-forget)
      runStartupTasks().catch((err: unknown) => {
        console.error('[VERCEL] Background startup tasks failed:', err);
      });

      console.log('[VERCEL] Express app initialized successfully');
    }

    app(req, res);
  } catch (err: any) {
    console.error('[VERCEL] Handler error:', err?.message);
    console.error('[VERCEL] Stack:', err?.stack);
    res.status(500).json({
      success: false,
      message: 'Falha na inicialização da aplicação',
      code: 'INIT_ERROR',
      ...(process.env.NODE_ENV !== 'production' && { detail: err?.message }),
    });
  }
}
