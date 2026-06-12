import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { AuthService } from './service';
import { loginSchema, forgotPasswordSchema, refreshTokenSchema } from './schema';
import { AuditLogRepository } from '../audit_log/repository';
import { AppError } from '../../shared/utils/AppError';

export class AuthController {
  private authService: AuthService;
  private auditLogRepository: AuditLogRepository;

  constructor() {
    this.authService = new AuthService();
    this.auditLogRepository = new AuditLogRepository();
    this.login = this.login.bind(this);
    this.forgotPassword = this.forgotPassword.bind(this);
    this.refresh = this.refresh.bind(this);
    this.logout = this.logout.bind(this);
  }

  public async login(req: Request, res: Response, next: NextFunction) {
    const email = req.body?.email;
    try {
      const data = loginSchema.parse(req.body);

      const result = await this.authService.login(data.email, data.password);

      this.auditLogRepository.create({
        userId: result.user.id,
        action: 'LOGIN',
        entityType: 'auth',
        entityId: result.user.id,
        newValues: { email: data.email },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      }).catch(err => console.error('Audit log error:', err));

      // SEG-001: Set httpOnly cookies for tokens (XSS protection)
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
      };
      res.cookie('kennelmanager_token', result.token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.cookie('kennelmanager_refresh_token', result.refreshToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });
      // SEG-002: Set non-httpOnly CSRF cookie (readable by JS)
      const csrfToken = crypto.randomBytes(32).toString('hex');
      res.cookie('csrf-token', csrfToken, { httpOnly: false, secure: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });

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
          newValues: { email },
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

      // SEG-001: Refresh httpOnly cookies
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
      };
      res.cookie('kennelmanager_token', result.token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.cookie('kennelmanager_refresh_token', result.refreshToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });

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

      // SEG-001: Clear httpOnly cookies
      res.clearCookie('kennelmanager_token');
      res.clearCookie('kennelmanager_refresh_token');
      res.clearCookie('csrf-token');

      return res.status(200).json({
        success: true,
        message: 'Logout realizado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  public async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const data = forgotPasswordSchema.parse(req.body);
      await this.authService.forgotPassword(data.email);

      this.auditLogRepository.create({
        userId: null,
        action: 'PASSWORD_RESET_REQUESTED',
        entityType: 'auth',
        newValues: { email: data.email },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      }).catch(err => console.error('Audit log error:', err));

      return res.status(200).json({
        success: true,
        message: 'Se este e-mail estiver cadastrado, você receberá as instruções em breve.',
      });
    } catch (error) {
      next(error);
    }
  }
}
