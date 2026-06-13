import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { redact } from '../shared/utils/redact';

const logDir = path.join(process.cwd(), 'logs');

// Attempt to create logs directory (may fail in serverless/Vercel read-only fs)
let fileLoggingAvailable = false;
try {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  fileLoggingAvailable = true;
} catch {
  console.warn('[LOGGER] Could not create logs directory. File logging disabled (Vercel serverless detected).');
}

// Redact sensitive fields (passwords, tokens, PII) BEFORE the log is
// formatted and written. LGPD/GDPR compliance — see RECOMMENDATIONS.md#r4.
const redactFormat = winston.format((info) => {
  if (info.message && typeof info.message === 'object') {
    info.message = redact(info.message);
  }
  info = redact(info);
  return info;
});

const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.printf(({ level, message, timestamp, stack, error, funnelId, ...meta }) => {
    let output = `${timestamp} ${level}: ${message}`;
    if (error) {
      const err = error as any;
      output += `\n  Erro: ${err.code || ''} ${err.message || JSON.stringify(err)}`;
    }
    if (Object.keys(meta).length > 0) output += `\n  Meta: ${JSON.stringify(meta)}`;
    if (stack) output += `\n  Stack: ${stack}`;
    return output;
  })
);

const transports: any[] = [];

if (fileLoggingAvailable) {
  transports.push(
    new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(logDir, 'combined.log') })
  );
}

// In development, or as fallback when file logging is unavailable, log to console
if (!fileLoggingAvailable || process.env.NODE_ENV !== 'production') {
  transports.push(new winston.transports.Console({ format: consoleFormat }));
}

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(redactFormat(), customFormat),
  defaultMeta: { service: 'canil-api' },
  transports,
});
