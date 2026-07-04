import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { env } from 'process';

import { swaggerSpec } from './config/swagger';
import { errorHandler } from './shared/middlewares/errorHandler';
import { logger } from './config/winston';
import { authMiddleware } from './shared/middlewares/auth';
import { auditMiddleware } from './shared/middlewares/audit';
import { csrfMiddleware } from './shared/middlewares/csrf';
import { authenticatedLimiter } from './config/rateLimiters';
import { AuthRepository } from './modules/auth/repository';
import { authRouter } from './modules/auth/router';
import { usersRouter } from './modules/users/router';
import { animalsRouter } from './modules/animals/router';
import { clientsRouter } from './modules/clients/router';
import { littersRouter } from './modules/litters/router';
import { puppiesRouter } from './modules/puppies/router';
import { financialRouter } from './modules/financial/router';
import { calendarRouter } from './modules/calendar/router';
import { healthRouter } from './modules/health/router';
import { documentsRouter } from './modules/documents/router';
import { salesRouter } from './modules/sales/router';
import { waitlistRouter } from './modules/waitlist/router';
import { clientInteractionsRouter } from './modules/client_interactions/router';
import { auditLogRouter } from './modules/audit_log/router';
import { systemConfigRouter } from './modules/system_config/router';
import litterHealthEventsRouter from './modules/litter_health_events/router';
import { notificationsRouter } from './modules/notifications/router';
import { installmentsRouter } from './modules/installments/router';
import { messageTemplatesRouter } from './modules/message_templates/router';

export function validateRequiredEnv() {
  const required = ['DATABASE_URL', 'JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long for security.');
  }

  // Validação flexível de NODE_ENV — aceita Vercel (production) e ambientes custom
  if (!process.env.NODE_ENV) {
    console.warn('[ENV] NODE_ENV not set. Defaulting to "production".');
    process.env.NODE_ENV = 'production';
  }

  if (!process.env.APP_URL && process.env.NODE_ENV === 'production') {
    console.warn('[ENV] APP_URL not set. Some features (Swagger, redirects) may not work correctly.');
  }
}

export function configureApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  // 1. Helmet for HTTP security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: process.env.NODE_ENV === 'production'
          ? ["'self'"]
          : ["'self'", "'unsafe-inline'"],
        styleSrc: process.env.NODE_ENV === 'production'
          ? ["'self'", "'unsafe-inline'"]
          : ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        styleSrcElem: process.env.NODE_ENV === 'production'
          ? ["'self'", "'unsafe-inline'"]
          : ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "blob:", "https://i.imgur.com", "https://imgur.com", "https://drive.google.com", "https://lh3.googleusercontent.com", "https://images.unsplash.com"],
        connectSrc: process.env.NODE_ENV === 'production' ? ["'self'"] : ["'self'", "ws://localhost:*"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        fontSrcElem: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        ...(process.env.NODE_ENV === 'production' ? { frameAncestors: ["'none'"] } : {}),
      },
    },
    crossOriginEmbedderPolicy: { policy: 'require-corp' },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    frameguard: { action: 'deny' },
    strictTransportSecurity: { maxAge: 31536000, includeSubDomains: true, preload: true },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  }));

  // Permissions-Policy header
  app.use((_req, res, next) => {
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
    next();
  });

  // 2. Compression middleware
  app.use(compression());

  // 3. CORS — safe defaults, never throw (prevents crash on Vercel cold start)
  const rawOrigins = env.CORS_ORIGINS || '';
  const corsOrigins = rawOrigins.split(',').map(s => s.trim());
  if (!rawOrigins && process.env.NODE_ENV === 'production') {
    console.warn('[CORS] CORS_ORIGINS not set. Allowing same-origin only.');
  }
  if (corsOrigins.includes('*') && process.env.NODE_ENV === 'production') {
    console.warn('[CORS] CORS_ORIGINS contains wildcard "*". Falling back to same-origin only.');
  }
  const corsOrigin = (corsOrigins.length > 0 && corsOrigins[0] !== '' && !corsOrigins.includes('*'))
    ? corsOrigins
    : false;
  app.use(cors({
    origin: corsOrigin,
    credentials: true,
  }));

  // 4. Rate limiting on login endpoint
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Muitas tentativas de login. Tente novamente em 15 minutos.', code: 'RATE_LIMIT_EXCEEDED' },
  });

  // 5. Body parsers
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));

  // 6. Morgan for HTTP request logging
  const morganStream = { write: (message: string) => logger.info(message.trim()) };
  if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined', { stream: morganStream }));
  } else {
    app.use(morgan('dev'));
  }

  // 7. Swagger UI - disabled in production by default, enable via ENABLE_SWAGGER=true (staging only)
  const swaggerEnabled = process.env.NODE_ENV === 'production'
    ? process.env.ENABLE_SWAGGER === 'true'
    : true; // always enabled in development/test

  if (swaggerEnabled) {
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    if (process.env.NODE_ENV !== 'production') {
      logger.info('[SWAGGER] Swagger UI enabled — available at /api/docs');
    }
    if (process.env.NODE_ENV === 'production' && process.env.ENABLE_SWAGGER === 'true') {
      logger.warn('[SWAGGER] ⚠ Swagger UI is ENABLED in production! Disable after staging verification.');
    }
  }

  // 8. Mount all routers under /api/v1
  app.use('/api/v1/auth/login', loginLimiter);
  app.use('/api/v1/auth', authRouter);

  // 9. CSRF protection for all non-auth mutating API routes
  app.use('/api/v1', (req, res, next) => {
    if (req.path.startsWith('/auth/')) return next();
    csrfMiddleware(req, res, next);
  });

  // 10. Global rate limiter
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    skip: (req) => req.path.startsWith('/api/v1/auth/'),
    message: { success: false, message: 'Muitas requisições. Tente novamente em 15 minutos.', code: 'RATE_LIMIT_EXCEEDED' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/v1', globalLimiter);

  // Prevent caching of API responses (LGPD compliance)
  app.use('/api', (_req: any, res: any, next: any) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  // All other routes require JWT authentication + audit logging
  // HIGH-002: `authenticatedLimiter` runs AFTER `authMiddleware` so it can
  // key the per-user bucket on `req.user.id`. It uses IP as a fallback only
  // when the request is unauthenticated.
  app.use('/api/v1/users', authMiddleware, authenticatedLimiter, auditMiddleware, usersRouter);
  app.use('/api/v1/animals', authMiddleware, authenticatedLimiter, auditMiddleware, animalsRouter);
  app.use('/api/v1/clients', authMiddleware, authenticatedLimiter, auditMiddleware, clientsRouter);
  app.use('/api/v1/litters', authMiddleware, authenticatedLimiter, auditMiddleware, littersRouter);
  app.use('/api/v1/puppies', authMiddleware, authenticatedLimiter, auditMiddleware, puppiesRouter);
  app.use('/api/v1/financial', authMiddleware, authenticatedLimiter, auditMiddleware, financialRouter);
  app.use('/api/v1/calendar', authMiddleware, authenticatedLimiter, auditMiddleware, calendarRouter);
  app.use('/api/v1/health', authMiddleware, authenticatedLimiter, auditMiddleware, healthRouter);
  app.use('/api/v1/documents', authMiddleware, authenticatedLimiter, auditMiddleware, documentsRouter);
  app.use('/api/v1/sales', authMiddleware, authenticatedLimiter, auditMiddleware, salesRouter);
  app.use('/api/v1/waitlist', authMiddleware, authenticatedLimiter, auditMiddleware, waitlistRouter);
  app.use('/api/v1/client-interactions', authMiddleware, authenticatedLimiter, auditMiddleware, clientInteractionsRouter);
  app.use('/api/v1/audit', authMiddleware, authenticatedLimiter, auditMiddleware, auditLogRouter);
  app.use('/api/v1/system-config', authMiddleware, authenticatedLimiter, auditMiddleware, systemConfigRouter);
  app.use('/api/v1/litter-health-events', authMiddleware, authenticatedLimiter, auditMiddleware, litterHealthEventsRouter);
  app.use('/api/v1/notifications', authMiddleware, authenticatedLimiter, auditMiddleware, notificationsRouter);
  app.use('/api/v1/installments', authMiddleware, authenticatedLimiter, auditMiddleware, installmentsRouter);
  app.use('/api/v1/message-templates', authMiddleware, authenticatedLimiter, auditMiddleware, messageTemplatesRouter);

  // Healthcheck endpoint
  app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running normally', data: { time: new Date() } });
  });

  // 404 Route Not Found Middleware (for /api routes only)
  app.use('/api', (req: Request, res: Response) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found`, code: 'ROUTE_NOT_FOUND' });
  });

  // Global Error Handler Middleware
  app.use(errorHandler);

  // Production: serve static dist/ and SPA fallback
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(process.cwd(), 'dist');
    app.use('/server.cjs.map', (_req, res) => res.status(404).end());
    app.use(express.static(distPath, { dotfiles: 'deny' }));

    // Protected uploads: require authentication to access uploaded files
    if (process.env.SERVE_UPLOADS === 'true') {
      const uploadsPath = path.join(process.cwd(), 'uploads');
      if (fs.existsSync(uploadsPath)) {
        app.use('/uploads', authMiddleware, express.static(uploadsPath));
        logger.info('[SECURITY] Uploads directory is publicly accessible via /uploads/ (auth required)');
      }
    }

    // SPA fallback: all non-API routes serve index.html
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return app;
}

export async function runStartupTasks() {
  // Helper: run token cleanup once with logging
  async function runTokenCleanup() {
    try {
      const authRepo = new AuthRepository();
      const deletedCount = await authRepo.cleanupExpiredRefreshTokens(30);
      if (deletedCount > 0) {
        logger.info(`[CLEANUP] Removed ${deletedCount} expired/revoked refresh tokens.`);
      }
    } catch (err) {
      logger.error('[CLEANUP] Failed to clean up expired refresh tokens:', { error: err });
    }
  }

  // In Vercel serverless, skip periodic cleanup — setInterval doesn't work
  // (instance is destroyed after each request) and cleanup runs on every cold start anyway.
  const isVercel = !!process.env.VERCEL;
  if (isVercel) {
    await runTokenCleanup();
    return;
  }

  // Non-Vercel: run on startup + schedule periodic cleanup every 24 hours
  await runTokenCleanup();
  scheduleTokenCleanup(runTokenCleanup);
}

/**
 * Schedule periodic refresh token cleanup.
 * Only called in long-running processes (not Vercel serverless).
 */
function scheduleTokenCleanup(cleanupFn: () => Promise<void>) {
  const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

  setInterval(async () => {
    logger.info('[CLEANUP] Running periodic refresh token cleanup...');
    await cleanupFn();
    logger.info('[CLEANUP] Periodic refresh token cleanup completed.');
  }, CLEANUP_INTERVAL_MS);

  logger.info('[CLEANUP] Scheduled refresh token cleanup every 24 hours.');
}
