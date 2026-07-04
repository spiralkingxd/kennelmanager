import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { AuthService } from './service';
import { loginSchema, refreshTokenSchema } from './schema';
import { AuditLogRepository } from '../audit_log/repository';
import { AppError } from '../../shared/utils/AppError';

export class AuthController {
  private authService: AuthService;
  private auditLogRepository: AuditLogRepository;

  constructor() {
    this.authService = new AuthService();
    this.auditLogRepository = new AuditLogRepository();
    this.login = this.login.bind(this);
    this.refresh = this.refresh.bind(this);
    this.logout = this.logout.bind(this);
  }

  public async login(req: Request, res: Response, next: NextFunction) {
    const username = req.body?.username;
    try {
      const data = loginSchema.parse(req.body);

      const result = await this.authService.login(data.username, data.password);

      this.auditLogRepository.create({
        userId: result.user.id,
        action: 'LOGIN',
        entityType: 'auth',
        entityId: result.user.id,
        newValues: { username: data.username },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      }).catch(err => console.error('Audit log error:', err));

      // SEG-001: Set cookies for tokens
      // path: '/' ensures cookies are sent on ALL requests, not just /api/v1/auth/login
      // sameSite: 'lax' — 'strict' prevents cookies from being attached to the first
      // fetch() calls after login in some browsers, causing an immediate 401 → redirect loop.
      // HIGH-001: both the access token AND refresh token cookies must be httpOnly
      // to prevent XSS-based token exfiltration. The browser will attach them
      // automatically to same-origin requests via `credentials: 'include'`.
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
      };
      const refreshCookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
      };
      res.cookie('kennelmanager_token', result.token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.cookie('kennelmanager_refresh_token', result.refreshToken, { ...refreshCookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });
      // SEG-002: Set non-httpOnly CSRF cookie (readable by JS)
      const csrfToken = crypto.randomBytes(32).toString('hex');
      res.cookie('csrf-token', csrfToken, { httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 7 * 24 * 60 * 60 * 1000 });

      return res.status(200).json({
        success: true,
        message: 'Login realizado com sucesso',
        data: result,
      });
    } catch (error) {
      if (error instanceof AppError && ['INVALID_CREDENTIALS', 'ACCOUNT_BLOCKED'].includes(error.code || '')) {
        this.auditLogRepository.create({
          userId: null,
          action: 'LOGIN_FAILED',
          entityType: 'auth',
          newValues: { username },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        }).catch(err => console.error('Audit log error:', err));
      }
      next(error);
    }
  }

  public async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = refreshTokenSchema.parse(req.body);
      const result = await this.authService.refresh(refreshToken);

      // SEG-001: Refresh cookies
      // HIGH-001: access token cookie is now httpOnly (inaccessible to JS).
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
      };
      const refreshCookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
      };
      res.cookie('kennelmanager_token', result.token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.cookie('kennelmanager_refresh_token', result.refreshToken, { ...refreshCookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });

      return res.status(200).json({
        success: true,
        message: 'Token renovado com sucesso',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (userId) {
        await this.authService.logout(userId);

        this.auditLogRepository.create({
          userId,
          action: 'LOGOUT',
          entityType: 'auth',
          entityId: userId,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        }).catch(err => console.error('Audit log error:', err));
      }

      // SEG-001: Clear cookies (must include path: '/' to match setCookie)
      res.clearCookie('kennelmanager_token', { path: '/' });
      res.clearCookie('kennelmanager_refresh_token', { path: '/' });
      res.clearCookie('csrf-token', { path: '/' });

      return res.status(200).json({
        success: true,
        message: 'Logout realizado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

}
