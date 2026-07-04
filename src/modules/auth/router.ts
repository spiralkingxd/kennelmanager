// auth/router.ts
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from './controller';

export const authRouter = Router();
const authController = new AuthController();

// Rate limiter for refresh endpoint: 5 requests per 15 minutes
const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Muitas tentativas de renovação de token. Tente novamente em 15 minutos.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Realiza o login no sistema
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Credenciais inválidas
 */
authRouter.post('/login', authController.login);
authRouter.post('/refresh', refreshLimiter, authController.refresh);
authRouter.post('/logout', authController.logout);
