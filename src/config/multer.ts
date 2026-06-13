import multer from 'multer';
import { AppError } from '../shared/utils/AppError';

// Vercel-compatible: use memoryStorage instead of diskStorage.
// In Vercel serverless, the filesystem is read-only (except /tmp).
// Files are stored in memory as buffers — use Supabase Storage or S3 for persistence.
const storage = multer.memoryStorage();

// Allowed file types
const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']);

const MAGIC_BYTES: Record<string, Uint8Array[]> = {
  'image/jpeg': [new Uint8Array([0xFF, 0xD8, 0xFF])],
  'image/png': [new Uint8Array([0x89, 0x50, 0x4E, 0x47])],
  'application/pdf': [new Uint8Array([0x25, 0x50, 0x44, 0x46])],
  'application/msword': [new Uint8Array([0xD0, 0xCF, 0x11, 0xE0])],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
    new Uint8Array([0x50, 0x4B, 0x03, 0x04]),
  ],
};

function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const signatures = MAGIC_BYTES[mimeType];
  if (!signatures) return false;
  return signatures.some(sig =>
    sig.every((byte, i) => buffer[i] === byte)
  );
}

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (allowedMimeTypes.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Tipo de arquivo não permitido', 400, true));
  }
};

const maxSize = (process.env.UPLOAD_MAX_SIZE_MB ? parseInt(process.env.UPLOAD_MAX_SIZE_MB, 10) : 10) * 1024 * 1024;

export const uploadConfig = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxSize,
    fieldSize: 1 * 1024 * 1024, // 1MB limit per field — prevents DoS via large text payloads
  }
});

export function validateUploadedFile(req: any, _res: any, next: any) {
  if (!req.file) return next();
  try {
    // memoryStorage: file.buffer is available directly — no disk I/O needed
    if (!validateMagicBytes(req.file.buffer, req.file.mimetype)) {
      return next(new AppError('Arquivo corrompido ou tipo não corresponde ao conteúdo.', 400, true));
    }
  } catch (err) {
    return next(err);
  }
  next();
}
