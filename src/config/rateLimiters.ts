import rateLimit from 'express-rate-limit';

// Rate limiting on user destruction (delete) endpoint - 5 requests per 15 min
export const userDestructionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Muitas requisições. Tente novamente em 15 minutos.', code: 'RATE_LIMIT_EXCEEDED' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting on user password reset endpoint - 5 requests per 15 min per IP
export const userPasswordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Muitas requisições. Tente novamente em 15 minutos.', code: 'RATE_LIMIT_EXCEEDED' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting on client destruction (delete/bulk delete) endpoint - 10 requests per 15 min
export const clientDestructionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Muitas requisições. Tente novamente em 15 minutos.', code: 'RATE_LIMIT_EXCEEDED' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting on financial transactions (create/delete) - 30 requests per 15 min
export const financialLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Muitas requisições. Tente novamente em 15 minutos.', code: 'RATE_LIMIT_EXCEEDED' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting on litter/animals/puppies destruction - 10 requests per 15 min
export const entityDestructionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Muitas requisições. Tente novamente em 15 minutos.', code: 'RATE_LIMIT_EXCEEDED' },
  standardHeaders: true,
  legacyHeaders: false,
});