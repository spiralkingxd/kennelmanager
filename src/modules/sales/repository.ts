import { pool } from '../../shared/config/db';

export class SalesRepository {
  public async findAll(skip: number, take: number, userId?: string) {
    const res = await pool.query(`
      SELECT s.*,
        c.name AS client_name, c.phone AS client_phone, c.email AS client_email,
         COALESCE(NULLIF(p.name, ''), NULLIF(p.color, ''), 'Filhote') AS puppy_name
      FROM sales s
      LEFT JOIN clients c ON c.id = s.client_id
      LEFT JOIN puppies p ON p.id = s.puppy_id
      WHERE ($3::uuid IS NULL OR s.created_by = $3)
      ORDER BY s.created_at DESC LIMIT $1 OFFSET $2
    `, [take, skip, userId ?? null]);
    return res.rows;
  }

  public async count(userId?: string) {
    const res = await pool.query('SELECT COUNT(*) FROM sales WHERE ($1::uuid IS NULL OR created_by = $1)', [userId ?? null]);
    return parseInt(res.rows[0].count);
  }

  public async findById(id: string, userId?: string) {
    const res = await pool.query(`
      SELECT s.*,
        c.name AS client_name, c.phone AS client_phone, c.email AS client_email,
         COALESCE(NULLIF(p.name, ''), NULLIF(p.color, ''), 'Filhote') AS puppy_name
      FROM sales s
      LEFT JOIN clients c ON c.id = s.client_id
      LEFT JOIN puppies p ON p.id = s.puppy_id
      WHERE s.id = $1 AND ($2::uuid IS NULL OR s.created_by = $2)
    `, [id, userId ?? null]);
    return res.rows[0] || null;
  }

  public async create(data: any) {
    const res = await pool.query(
      `INSERT INTO sales (client_id, puppy_id, status, condition, entry_value, total_value, notes, completed_at, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7,
         CASE WHEN $8 = 'COMPLETED' THEN CURRENT_TIMESTAMP ELSE NULL END,
         $9) RETURNING *`,
      [data.clientId, data.puppyId || null, data.status || 'PENDING', data.condition || 'CASH',
       data.entryValue || null, data.totalValue || null, data.notes || null,
       data.status || 'PENDING', data.createdBy]
    );
    return res.rows[0];
  }

  public async createFromTransaction(client: any, data: any) {
    const res = await client.query(
      `INSERT INTO sales (client_id, puppy_id, status, condition, entry_value, total_value, notes, completed_at, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7,
         CASE WHEN $8 = 'COMPLETED' THEN CURRENT_TIMESTAMP ELSE NULL END,
         $9) RETURNING *`,
      [data.clientId, data.puppyId || null, data.status || 'PENDING', data.condition || 'CASH',
       data.entryValue || null, data.totalValue || null, data.notes || null,
       data.status || 'PENDING', data.createdBy]
    );
    return res.rows[0];
  }

  public async update(id: string, data: any, userId?: string) {
    const fields: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (data.clientId !== undefined) { fields.push(`client_id = $${idx++}`); params.push(data.clientId); }
    if (data.puppyId !== undefined) { fields.push(`puppy_id = $${idx++}`); params.push(data.puppyId); }
    if (data.status !== undefined) {
      const stIdx = idx++;
      fields.push(`status = $${stIdx}`);
      fields.push(`completed_at = CASE WHEN $${idx++}::text = 'COMPLETED' THEN CURRENT_TIMESTAMP ELSE NULL END`);
      params.push(data.status, data.status);
    }
    if (data.condition !== undefined) { fields.push(`condition = $${idx++}`); params.push(data.condition); }
    if (data.entryValue !== undefined) { fields.push(`entry_value = $${idx++}`); params.push(data.entryValue); }
    if (data.totalValue !== undefined) { fields.push(`total_value = $${idx++}`); params.push(data.totalValue); }
    if (data.notes !== undefined) { fields.push(`notes = $${idx++}`); params.push(data.notes); }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    params.push(id);
    const idIdx = idx++;
    params.push(userId ?? null);
    const userIdIdx = idx++;

    const res = await pool.query(
      `UPDATE sales SET ${fields.join(', ')} WHERE id = $${idIdx} AND ($${userIdIdx}::uuid IS NULL OR created_by = $${userIdIdx}) RETURNING *`,
      params
    );
    return res.rows[0];
  }

  public async findPendingByPuppyId(puppyId: string, userId?: string) {
    const res = await pool.query(`
      SELECT s.*,
        c.name AS client_name, c.phone AS client_phone, c.email AS client_email,
         COALESCE(NULLIF(p.name, ''), NULLIF(p.color, ''), 'Filhote') AS puppy_name
      FROM sales s
      LEFT JOIN clients c ON c.id = s.client_id
      LEFT JOIN puppies p ON p.id = s.puppy_id
      WHERE s.puppy_id = $1 AND s.status = 'PENDING'
        AND ($2::uuid IS NULL OR s.created_by = $2)
      ORDER BY s.created_at DESC LIMIT 1
    `, [puppyId, userId ?? null]);
    return res.rows[0] || null;
  }

  public async delete(id: string, userId?: string) {
    const res = await pool.query('DELETE FROM sales WHERE id = $1 AND ($2::uuid IS NULL OR created_by = $2) RETURNING *', [id, userId ?? null]);
    return res.rows[0];
  }
}
