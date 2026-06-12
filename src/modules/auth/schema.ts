import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Email é obrigatório')
    .email('Formato de e-mail inválido'),
  password: z
    .string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'A senha deve conter pelo menos um número'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Email é obrigatório')
    .email('Formato de e-mail inválido'),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório').max(500),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

export const loginResponseSchema = z.object({
  token: z.string(),
  refreshToken: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    role: z.string(),
  }),
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;
