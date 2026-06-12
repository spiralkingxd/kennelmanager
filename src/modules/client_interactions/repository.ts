import { pool } from '../../shared/config/db';
import { buildUpdateQuery } from '../../shared/utils/updateHelper';

export class ClientInteractionsRepository {
  public async findAll(skip: number, take: number, userId?: string) {
    const res = await pool.query(`
      SELECT i.*, u.name AS user_name, c.name AS client_name
      FROM client_interactions i
      LEFT JOIN users u ON u.id = i.user_id
      LEFT JOIN clients c ON c.id = i.client_id
      WHERE ($3::uuid IS NULL OR i.user_id = $3)
      ORDER BY i.date DESC LIMIT $1 OFFSET $2
    `, [take, skip, userId ?? null]);
    return res.rows;
  }
  public async count(userId?: string) {
    const query = 'SELECT COUNT(*) FROM client_interactions WHERE ($1::uuid IS NULL OR user_id = $1)';
    const params: any[] = [userId ?? null];
    const res = await pool.query(query, params);
    return parseInt(res.rows[0].count);
  }
  public async findByClientId(clientId: string, userId?: string) {
    const res = await pool.query(`
      SELECT i.*, u.name AS user_name, c.name AS client_name
      FROM client_interactions i
      LEFT JOIN users u ON u.id = i.user_id
      LEFT JOIN clients c ON c.id = i.client_id
      WHERE i.client_id = $1 AND ($2::uuid IS NULL OR i.user_id = $2)
      ORDER BY i.date DESC
    `, [clientId, userId ?? null]);
    return res.rows;
  }
  public async findById(id: string, userId?: string) {
    const res = await pool.query(`
      SELECT i.*, u.name AS user_name, c.name AS client_name
      FROM client_interactions i
      LEFT JOIN users u ON u.id = i.user_id
      LEFT JOIN clients c ON c.id = i.client_id
      WHERE i.id = $1 AND ($2::uuid IS NULL OR i.user_id = $2)
    `, [id, userId ?? null]);
    return res.rows[0] || null;
  }
  public async create(data: any) {
    const res = await pool.query(
      `INSERT INTO client_interactions (client_id, type, description, date, follow_up_date, follow_up_notes, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [data.clientId, data.type || 'OTHER', data.description, data.date || new Date().toISOString(), data.followUpDate || null, data.followUpNotes || null, data.userId || null]
    );
    return res.rows[0];
  }
  public async update(id: string, data: any, userId?: string) {
    // client_interactions usa user_id para isolamento em vez de created_by
    // e não tem coluna updated_at — fazemos o UPDATE inline com esse padrão
    const fieldMap: Record<string, string> = {
      type: 'type',
      description: 'description',
      date: 'date',
      followUpDate: 'follow_up_date',
      followUpNotes: 'follow_up_notes',
      userId: 'user_id',
    };

    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) {
        fields.push(`${col} = $${paramIndex}`);
        values.push(data[key]);
        paramIndex++;
      }
    }

    if (fields.length === 0) return null;

    values.push(id);
    const idParam = paramIndex;
    paramIndex++;

    const userIdParam = userId ?? null;
    values.push(userIdParam);
    const userWhereParam = paramIndex;

    const sql = `UPDATE client_interactions SET ${fields.join(', ')} WHERE id = $${idParam} AND ($${userWhereParam}::uuid IS NULL OR user_id = $${userWhereParam}) RETURNING *`;
    const res = await pool.query(sql, values);
    return res.rows[0];
  }
  public async delete(id: string, userId?: string) {
    const res = await pool.query('DELETE FROM client_interactions WHERE id = $1 AND ($2::uuid IS NULL OR user_id = $2) RETURNING *', [id, userId ?? null]);
    return res.rows[0];
  }
}
