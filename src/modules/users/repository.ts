import { pool } from '../../shared/config/db';
import { buildUpdateQuery } from '../../shared/utils/updateHelper';

const USER_COLUMNS = 'id, name, email, phone, avatar_path, role, status, last_login, login_attempts, blocked_at, require_password_change, is_protected, created_by, created_at, updated_at';

export class UsersRepository {
  public async findAll(skip: number, take: number, userId?: string) {
    const query = `SELECT ${USER_COLUMNS} FROM users WHERE ($3::uuid IS NULL OR created_by = $3) ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
    const params: any[] = [take, skip, userId ?? null];
    const res = await pool.query(query, params);
    return res.rows;
  }
  public async count(userId?: string) {
    const query = 'SELECT COUNT(*) FROM users WHERE ($1::uuid IS NULL OR created_by = $1)';
    const params: any[] = [userId ?? null];
    const res = await pool.query(query, params);
    return parseInt(res.rows[0].count);
  }
  public async findById(id: string, userId?: string) {
    const query = `SELECT ${USER_COLUMNS} FROM users WHERE id = $1 AND ($2::uuid IS NULL OR created_by = $2)`;
    const params: any[] = [id, userId ?? null];
    const res = await pool.query(query, params);
    return res.rows[0] || null;
  }
  public async create(data: any) {
    const res = await pool.query(
      `INSERT INTO users (name, email, password_hash, phone, role, status, created_by, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7::uuid, CURRENT_TIMESTAMP) RETURNING ${USER_COLUMNS}`,
      [data.name, data.email, data.passwordHash || '', data.phone, data.role || 'READONLY', data.status || 'ACTIVE', data.createdBy]
    );
    return res.rows[0];
  }
  public async update(id: string, data: any, userId?: string) {
    const row = await buildUpdateQuery('users', id, data, {
      name: 'name',
      email: 'email',
      phone: 'phone',
      role: 'role',
      status: 'status',
    }, userId);
    return row;
  }
  public async delete(id: string, userId?: string) {
    const query = `DELETE FROM users WHERE id = $1 AND ($2::uuid IS NULL OR created_by = $2) RETURNING ${USER_COLUMNS}`;
    const params: any[] = [id, userId ?? null];
    const res = await pool.query(query, params);
    return res.rows[0];
  }
}
