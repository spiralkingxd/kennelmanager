import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';
import { logger } from '../../config/winston';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = { ...err, message: err.message };

  // Always log to console for debugging visibility
  console.error(`[ERROR] ${req.method} ${req.path}: ${err.message}`, err.stack?.split('\n').slice(0, 4).join('\n') || '');

  // Log error using Winston
  if (!err.isOperational) {
    logger.error(`[UNHANDLED ERROR] ${err.message}`, { stack: err.stack, path: req.path, method: req.method });
  } else {
    logger.warn(`[OPERATIONAL ERROR] ${err.message}`, { path: req.path, method: req.method });
  }

  // Zod Validation Error
  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map(e => ({ field: e.path.join('.'), message: e.message }));
    error = new AppError('Erro de validação dos dados fornecidos.', 422, true, 'VALIDATION_ERROR', formattedErrors);
  }

  // Catch-all for unmapped PostgreSQL errors — prevents DB schema disclosure
  if (err.code && /^[235]\d{3}$/.test(err.code)) {
    error = new AppError('Erro de integridade dos dados.', 400, true, 'DATABASE_ERROR');
  }

  // PostgreSQL error code mapping
  const PG_ERROR_MAP: Record<string, { status: number; code: string; message: string }> = {
    '23505': { status: 409, code: 'DUPLICATE_RECORD', message: 'Registro duplicado.' },
    '23503': { status: 409, code: 'FOREIGN_KEY_VIOLATION', message: 'Registro referenciado não encontrado.' },
    '23502': { status: 400, code: 'NOT_NULL_VIOLATION', message: 'Campo obrigatório não preenchido.' },
    '42P01': { status: 500, code: 'DB_CONFIG_ERROR', message: 'Erro interno de configuração do banco.' },
    '42703': { status: 500, code: 'DB_CONFIG_ERROR', message: 'Erro interno de configuração do banco.' },
    '57014': { status: 504, code: 'QUERY_TIMEOUT', message: 'A consulta excedeu o tempo limite.' },
    '08006': { status: 503, code: 'DB_CONNECTION_ERROR', message: 'Banco de dados indisponível.' },
    '53300': { status: 503, code: 'TOO_MANY_CONNECTIONS', message: 'Muitas conexões simultâneas.' },
    'P0001': { status: 409, code: 'TRIGGER_ERROR', message: 'Operação rejeitada pelo banco de dados.' },
  };

  // Check for known PostgreSQL error codes
  if (err.code && PG_ERROR_MAP[err.code]) {
    const pgErr = PG_ERROR_MAP[err.code];
    error = new AppError(pgErr.message, pgErr.status, true, pgErr.code);
  }

  // Multer Error (Example name, usually 'MulterError' from multer object, we match by name)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error = new AppError('Arquivo muito grande. Tamanho máximo excedido.', 400, true, 'FILE_TOO_LARGE');
    } else if (err.code === 'LIMIT_FIELD_SIZE') {
      error = new AppError('Campo muito grande.', 400, true, 'FIELD_TOO_LARGE');
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      error = new AppError('Número inesperado de arquivos.', 400, true, 'UNEXPECTED_FILE');
    } else {
      error = new AppError('Erro no upload do arquivo.', 400, true, 'UPLOAD_ERROR');
    }
  }

  // Fallback properties
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Erro interno do servidor';
  const code = error.code || 'INTERNAL_SERVER_ERROR';

  // In production, do not send stack traces to client!
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    return res.status(statusCode).json({
      success: false,
      message: 'Ocorreu um erro inesperado no servidor. Tente novamente mais tarde.',
      code: 'INTERNAL_SERVER_ERROR',
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    code,
    ...(error.errors && { errors: error.errors }),
  });
};
