// Vercel Serverless Function Entry Point
// Uses STATIC imports (not dynamic) so @vercel/node/esbuild bundles correctly.
// All module-level crash sources (winston mkdir, swagger scan, DB pool) have
// been made resilient — see src/config/winston.ts and src/config/swagger.ts.

import { configureApp, validateRequiredEnv, runStartupTasks } from '../src/expressApp';
import type { Application } from 'express';

let cachedApp: Application | null = null;

export default async function handler(req: any, res: any) {
  if (!cachedApp) {
    try {
      validateRequiredEnv();
      cachedApp = configureApp();
      // Fire-and-forget background tasks — never block the response
      runStartupTasks().catch((err: Error) => {
        console.error('[VERCEL] Background startup tasks failed:', err?.message || err);
      });
    } catch (err: any) {
      console.error('[VERCEL] Startup failed:', err?.message || err);
      // Return a graceful error — never leak stack traces
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Server configuration error. Please check environment variables.',
          code: 'VERCEL_CONFIG_ERROR',
        }));
      }
      return;
    }
  }

  try {
    cachedApp(req, res);
  } catch (err: any) {
    console.error('[VERCEL] Handler error:', err?.message || err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Unexpected server error.',
        code: 'VERCEL_HANDLER_ERROR',
      }));
    }
  }
}
