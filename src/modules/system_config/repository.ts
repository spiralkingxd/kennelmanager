import { pool } from '../../shared/config/db';

export class SystemConfigRepository {
  public async findAll() {
    const res = await pool.query('SELECT key, value, description, updated_by, created_at, updated_at FROM system_config ORDER BY key ASC');
    return res.rows;
  }

  public async findByKey(key: string) {
    const res = await pool.query('SELECT key, value, description, updated_by, created_at, updated_at FROM system_config WHERE key = $1', [key]);
    return res.rows[0] || null;
  }

  public async upsert(key: string, value: any, description: string | null, updatedBy: string) {
    const res = await pool.query(
      `INSERT INTO system_config (key, value, description, updated_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (key) DO UPDATE SET
         value = EXCLUDED.value,
         description = COALESCE(EXCLUDED.description, system_config.description),
         updated_by = EXCLUDED.updated_by,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [key, JSON.stringify(value), description, updatedBy]
    );
    return res.rows[0];
  }

  public async delete(key: string) {
    const res = await pool.query('DELETE FROM system_config WHERE key = $1 RETURNING *', [key]);
    return res.rows[0] || null;
  }
}
