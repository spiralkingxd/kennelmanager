// Vercel Serverless Entry Point
// Compilado nativamente pelo @vercel/node (TypeScript suportado)
// Lazy singleton: cria o Express app apenas no primeiro request

import { configureApp, validateRequiredEnv, runStartupTasks } from '../src/expressApp';
import type { Request, Response } from 'express';

let app: ReturnType<typeof configureApp> | null = null;

export default function handler(req: Request, res: Response) {
  if (!app) {
    try {
      // Garante NODE_ENV (Vercel nem sempre seta explicitamente)
      if (!process.env.NODE_ENV) {
        process.env.NODE_ENV = 'production';
      }

      validateRequiredEnv();
      app = configureApp();

      // Startup tasks rodam em background (fire-and-forget)
      runStartupTasks().catch((err: unknown) => {
        console.error('[VERCEL] Background startup tasks failed:', err);
      });

      console.log('[VERCEL] Express app initialized successfully');
    } catch (err: any) {
      console.error('[VERCEL] Failed to initialize Express app:', err.message);
      res.status(500).json({
        success: false,
        message: 'Falha na inicialização da aplicação',
        code: 'INIT_ERROR',
      });
      return;
    }
  }

  app(req, res);
}
