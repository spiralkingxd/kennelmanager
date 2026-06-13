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
    const expressModule = await import('express');
    const { configureApp, validateRequiredEnv } = await import('../src/expressApp');

    validateRequiredEnv();
    const app = configureApp();

    // Background tasks (fire-and-forget — never block the response)
    import('../src/expressApp').then(({ runStartupTasks }) => {
      runStartupTasks().catch((err: Error) => {
        console.error('[VERCEL] Background startup tasks failed:', err?.message || err);
      });
    });

    cachedApp = app;
  } catch (err: any) {
    console.error('[VERCEL] Startup failed:', err?.message || err);
    // Graceful error app — never leak stack traces
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
  }
}

export default async function handler(req: any, res: any) {
  const app = await getApp();
  app(req, res);
}
