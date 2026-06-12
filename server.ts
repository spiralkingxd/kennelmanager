import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { createServer as createViteServer } from 'vite';
import { env } from 'process';

import { swaggerSpec } from './src/config/swagger';
import { errorHandler } from './src/shared/middlewares/errorHandler';
import { logger } from './src/config/winston';
import { authMiddleware } from './src/shared/middlewares/auth';
import { auditMiddleware } from './src/shared/middlewares/audit';
// Import routers here
import { AuthRepository } from './src/modules/auth/repository';
import { authRouter } from './src/modules/auth/router';
import { usersRouter } from './src/modules/users/router';
import { animalsRouter } from './src/modules/animals/router';
import { clientsRouter } from './src/modules/clients/router';
import { littersRouter } from './src/modules/litters/router';
import { puppiesRouter } from './src/modules/puppies/router';
import { financialRouter } from './src/modules/financial/router';
import { calendarRouter } from './src/modules/calendar/router';
import { healthRouter } from './src/modules/health/router';
import { documentsRouter } from './src/modules/documents/router';
import { salesRouter } from './src/modules/sales/router';
import { waitlistRouter } from './src/modules/waitlist/router';
import { clientInteractionsRouter } from './src/modules/client_interactions/router';
import { auditLogRouter } from './src/modules/audit_log/router';
import { systemConfigRouter } from './src/modules/system_config/router';
import litterHealthEventsRouter from './src/modules/litter_health_events/router';
import { notificationsRouter } from './src/modules/notifications/router';
import { installmentsRouter } from './src/modules/installments/router';
import { messageTemplatesRouter } from './src/modules/message_templates/router';
import { pool } from './src/shared/config/db';

function validateRequiredEnv() {
  const required = ['DATABASE_URL', 'JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.error(`FATAL: Missing required environment variables: ${missing.join(', ')}`);
    console.error('Make sure you have a .env file or the variables are set in the environment.');
    process.exit(1);
  }

  // SEG-010: Validar força do JWT_SECRET
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.error('FATAL: JWT_SECRET must be at least 32 characters long for security.');
    console.error('Generate a strong secret: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    process.exit(1);
  }

  // Validate NODE_ENV
  const validEnvs = ['production', 'development', 'test'];
  if (!process.env.NODE_ENV || !validEnvs.includes(process.env.NODE_ENV)) {
    console.error(`FATAL: NODE_ENV must be one of: ${validEnvs.join(', ')}. Current value: "${process.env.NODE_ENV}"`);
    console.error('Set NODE_ENV=production in production, or NODE_ENV=development for local development.');
    process.exit(1);
  }

  // Validate APP_URL (used for Swagger and other external references)
  if (!process.env.APP_URL) {
    if (process.env.NODE_ENV === 'production') {
      console.error('FATAL: APP_URL is required in production environments.');
      process.exit(1);
    }
    console.warn('WARNING: APP_URL not set. Some features (Swagger, redirects) may not work correctly.');
  }
}

async function gracefulShutdown(signal: string) {
  console.log(`[SHUTDOWN] Received ${signal}. Closing database pool...`);
  try {
    await pool.end();
    console.log('[SHUTDOWN] Database pool closed. Exiting.');
  } catch (err) {
    console.error('[SHUTDOWN] Error closing pool:', err);
  }
  process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

async function startServer() {
  validateRequiredEnv();
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  const PORT = parseInt(process.env.PORT || '3000', 10);

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

  // Permissions-Policy header (separado porque helmet v8 não suporta nativamente)
  app.use((_req, res, next) => {
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
    next();
  });

  // 2. Compression middleware for gzip/deflate
  app.use(compression());

  // 3. CORS
  const rawOrigins = env.CORS_ORIGINS || '';
  if (!rawOrigins && process.env.NODE_ENV === 'production') {
    console.error('FATAL: CORS_ORIGINS is required in production environments.');
    process.exit(1);
  }
  const corsOrigins = rawOrigins.split(',').map(s => s.trim());
  if (corsOrigins.includes('*') && process.env.NODE_ENV === 'production') {
    console.error('FATAL: CORS_ORIGINS cannot contain wildcard "*" in production.');
    process.exit(1);
  }
  app.use(cors({
    origin: corsOrigins,
    credentials: true,
  }));

  // 4. Rate limiting on login endpoint
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  });

  // Rate limiting on forgot-password endpoint
  const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Muitas tentativas de recuperação de senha. Tente novamente em 15 minutos.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  });

  // 5. Express JSON body parser with 1mb limit
  app.use(express.json({ limit: '1mb' }));

  // 6. URL-encoded body parser
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));

  // 7. Morgan for HTTP request logging
  const morganStream = {
    write: (message: string) => logger.info(message.trim()),
  };
  if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined', { stream: morganStream }));
  } else {
    app.use(morgan('dev'));
  }

  // 8. Swagger UI - only available outside production
  if (process.env.NODE_ENV !== 'production') {
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  // 9. Mount all routers under /api/v1 prefix
  // Auth routes are public (with rate limiting)
  app.use('/api/v1/auth/login', loginLimiter);
  app.use('/api/v1/auth/forgot-password', forgotPasswordLimiter);
  app.use('/api/v1/auth', authRouter);

  // Global rate limiter for all API routes (auth routes have their own specific limiters above)
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    skip: (req) => req.path.startsWith('/api/v1/auth/'),
    message: { success: false, message: 'Muitas requisições. Tente novamente em 15 minutos.', code: 'RATE_LIMIT_EXCEEDED' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/v1', globalLimiter);

  // Prevent caching of API responses containing sensitive data (LGPD compliance)
  app.use('/api', (_req: any, res: any, next: any) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  // All other routes require JWT authentication AND automatic audit logging
  // (LGPD: every mutating operation must be persisted to audit_log)
  app.use('/api/v1/users', authMiddleware, auditMiddleware, usersRouter);
  app.use('/api/v1/animals', authMiddleware, auditMiddleware, animalsRouter);
  app.use('/api/v1/clients', authMiddleware, auditMiddleware, clientsRouter);
  app.use('/api/v1/litters', authMiddleware, auditMiddleware, littersRouter);
  app.use('/api/v1/puppies', authMiddleware, auditMiddleware, puppiesRouter);
  app.use('/api/v1/financial', authMiddleware, auditMiddleware, financialRouter);
  app.use('/api/v1/calendar', authMiddleware, auditMiddleware, calendarRouter);
  app.use('/api/v1/health', authMiddleware, auditMiddleware, healthRouter);
  app.use('/api/v1/documents', authMiddleware, auditMiddleware, documentsRouter);
  app.use('/api/v1/sales', authMiddleware, auditMiddleware, salesRouter);
  app.use('/api/v1/waitlist', authMiddleware, auditMiddleware, waitlistRouter);
  app.use('/api/v1/client-interactions', authMiddleware, auditMiddleware, clientInteractionsRouter);
  app.use('/api/v1/audit', authMiddleware, auditMiddleware, auditLogRouter);
  app.use('/api/v1/system-config', authMiddleware, auditMiddleware, systemConfigRouter);
  app.use('/api/v1/litter-health-events', authMiddleware, auditMiddleware, litterHealthEventsRouter);
  app.use('/api/v1/notifications', authMiddleware, auditMiddleware, notificationsRouter);
  app.use('/api/v1/installments', authMiddleware, auditMiddleware, installmentsRouter);
  app.use('/api/v1/message-templates', authMiddleware, auditMiddleware, messageTemplatesRouter);
  
  // Healthcheck endpoint
  app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running normally', data: { time: new Date() } });
  });

  // 10. 404 Route Not Found Middleware
  app.use('/api', (req: Request, res: Response) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found`, code: 'ROUTE_NOT_FOUND' });
  });

  // 11. Global Error Handler Middleware
  app.use(errorHandler);

  // --- VITE MIDDLEWARE FOR DEVELOPMENT OR STATIC SERVING IN PRODUCTION ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use('/server.cjs.map', (_req, res) => res.status(404).end());
    app.use(express.static(distPath, { dotfiles: 'deny' }));

    // Serve uploaded files (disabled by default for security — enable via SERVE_UPLOADS=true)
    if (process.env.SERVE_UPLOADS === 'true') {
      const uploadsPath = path.join(process.cwd(), 'uploads');
      if (fs.existsSync(uploadsPath)) {
        app.use('/uploads', express.static(uploadsPath));
        logger.warn('[SECURITY] Uploads directory is publicly accessible via /uploads/');
      }
    }

    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Clean up expired refresh tokens on startup + periodic cleanup
  try {
    const authRepo = new AuthRepository();
    const deletedCount = await authRepo.cleanupExpiredRefreshTokens(30);
    if (deletedCount > 0) {
      logger.info(`[CLEANUP] Removed ${deletedCount} expired/revoked refresh tokens.`);
    }
  } catch (err) {
    logger.error('[CLEANUP] Failed to clean up expired refresh tokens:', { error: err });
  }
  // Run cleanup every 24 hours
  setInterval(async () => {
    try {
      const authRepo = new AuthRepository();
      await authRepo.cleanupExpiredRefreshTokens(30);
    } catch (err) {
      logger.error('[CLEANUP] Periodic refresh token cleanup failed:', { error: err });
    }
  }, 24 * 60 * 60 * 1000);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Swagger docs available at http://localhost:${PORT}/api/docs`);
    }
  });
}

startServer().catch(err => {
  console.error("Failed to start server", err);
  process.exit(1);
});
