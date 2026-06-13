// Vercel Serverless Function Entry Point
// Uses lazy initialization with dynamic import to catch ANY module-level crash
// (Winston mkdir failure, swagger scan errors, DB pool issues, etc.)

import type { Application } from 'express';

// Lazy singleton — initialized on first request, cached for warm starts
let cachedApp: Application | null = null;
let initPromise: Promise<void> | null = null;

async function getApp(): Promise<Application> {
  if (cachedApp) return cachedApp;
  if (!initPromise) {
    initPromise = initializeApp();
  }
  await initPromise;
  return cachedApp!;
}

async function initializeApp(): Promise<void> {
  try {
    // Dynamic import catches ALL transitive module-level failures
    const appModule = await import('../src/expressApp');
    const { configureApp, validateRequiredEnv } = appModule;

    validateRequiredEnv();
    cachedApp = configureApp();

    // Background tasks (fire-and-forget — never block the response)
    // Runs after app is set so cold start returns fast
    appModule.runStartupTasks().catch((err: Error) => {
      console.error('[VERCEL] Background startup tasks failed:', err?.message || err);
    });
  } catch (err: any) {
    console.error('[VERCEL] Startup failed:', err?.message || err);
    // Graceful error app — never leak stack traces to client
    try {
      const express = (await import('express')).default;
      const errorApp = express();
      errorApp.all('*', (_req, res) => {
        res.status(500).json({
          success: false,
          message: 'Server configuration error. Please check environment variables.',
          code: 'VERCEL_CONFIG_ERROR',
        });
      });
      cachedApp = errorApp;
    } catch (fallbackErr) {
      // Absolute last resort — nothing works, return a bare 500
      console.error('[VERCEL] Fatal: even error app creation failed:', fallbackErr);
      cachedApp = ((_req: any, res: any) => {
        res.statusCode = 500;
        res.end('500 Internal Server Error');
      }) as unknown as Application;
    }
  }
}

export default async function handler(req: any, res: any) {
  try {
    const app = await getApp();
    app(req, res);
  } catch (err: any) {
    console.error('[VERCEL] Handler fatal error:', err?.message || err);
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
