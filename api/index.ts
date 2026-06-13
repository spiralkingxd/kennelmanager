// Vercel Serverless Function Entry Point
// Vercel's @vercel/node runtime compiles this and wraps the exported Express app.
// IMPORTANT: Set all env vars in Vercel Dashboard (DATABASE_URL, JWT_SECRET, etc.)

import express from 'express';
import { configureApp, validateRequiredEnv, runStartupTasks } from '../src/expressApp';

let app: express.Application;

try {
  validateRequiredEnv();
  app = configureApp();

  // Run background tasks (non-blocking in serverless context)
  runStartupTasks().catch((err) => {
    console.error('[VERCEL] Background startup tasks failed:', err);
  });
} catch (err: any) {
  console.error('[VERCEL] Startup failed:', err.message);
  // Graceful fallback: return a clear error instead of crashing
  app = express();
  app.use('*', (_req, res) => {
    res.status(500).json({
      success: false,
      message: 'Server configuration error. Check environment variables.',
      code: 'VERCEL_CONFIG_ERROR',
    });
  });
}

export default app;
