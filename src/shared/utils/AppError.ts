export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;
  public errors?: any[];

  constructor(message: string, statusCode: number, isOperational = true, code?: string, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code || 'INTERNAL_ERROR';
    this.errors = errors;

    // Restore prototype chain
    Object.setPrototypeOf(this, new.target.prototype);

    Error.captureStackTrace(this, this.constructor);
  }
}
