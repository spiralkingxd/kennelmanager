import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { env } from 'process';
import { AppError } from '../shared/utils/AppError';

// Define the root upload directory based on environment variable or default
const uploadRoot = env.UPLOAD_PATH || path.join(process.cwd(), 'uploads');

// Ensure root directory exists
if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, { recursive: true });
}

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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Organise files into subdirectories based on their fieldname or module name
    // Assuming the router provides req.params.module or we use fieldname
    const moduleName = (req.params.module || file.fieldname || 'misc')
      .replace(/[^a-zA-Z0-9_-]/g, '');
    if (!moduleName) return cb(new AppError('Invalid module name', 400), '');

    const folderPath = path.join(uploadRoot, moduleName);
    const resolvedPath = path.resolve(folderPath);
    if (!resolvedPath.startsWith(path.resolve(uploadRoot))) {
      return cb(new AppError('Invalid path', 400), '');
    }

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

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
    const buffer = Buffer.alloc(8);
    const fd = fs.openSync(req.file.path, 'r');
    fs.readSync(fd, buffer, 0, 8, 0);
    fs.closeSync(fd);
    if (!validateMagicBytes(buffer, req.file.mimetype)) {
      fs.unlinkSync(req.file.path);
      return next(new AppError('Arquivo corrompido ou tipo não corresponde ao conteúdo.', 400, true));
    }
  } catch (err) {
    return next(err);
  }
  next();
}
