import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { pool } from '../../shared/config/db';
import { UsersRepository } from './repository';
import { AppError } from '../../shared/utils/AppError';
export class UsersService {
  private repository: UsersRepository;
  constructor() { this.repository = new UsersRepository(); }
  public async getAll(skip: number, take: number, userId?: string) {
    const data = await this.repository.findAll(skip, take, userId);
    const total = await this.repository.count(userId);
    return { data, total };
  }
  public async getById(id: string, userId?: string) {
    const data = await this.repository.findById(id, userId);
    if (!data) throw new AppError('Registro não encontrado', 404, true, 'NOT_FOUND');
    return data;
  }
  public async create(data: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.repository.create({ ...data, passwordHash: hashedPassword });
  }
  public async update(id: string, data: any, userId?: string) {
    await this.getById(id, userId); // ensure exists
    return this.repository.update(id, data, userId);
  }
  public async delete(id: string, userId?: string) {
    await this.getById(id, userId); // ensure exists
    return this.repository.delete(id, userId);
  }
  public async resetPassword(id: string, userId?: string) {
    // Server-side random: 9 bytes (72 bits) → base64url → 12 chars (slice(0,14) is a no-op)
    const tempPassword = randomBytes(9).toString('base64url').slice(0, 14);
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    // Direct SQL because repository.update does not touch password_hash column
    const result = await pool.query(
      `UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND ($3::uuid IS NULL OR created_by = $3) RETURNING id, email`,
      [passwordHash, id, userId ?? null]
    );
    if (result.rows.length === 0) {
      throw new AppError('Registro não encontrado', 404, true, 'NOT_FOUND');
    }
    // SECURITY H-8: never return the temporary password in the HTTP response
    // Send it via a secure out-of-band channel (e.g. email) in production
    return { success: true, message: 'Senha redefinida com sucesso.' };
  }
}
