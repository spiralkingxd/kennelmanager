import { pool } from '../../shared/config/db';

export class PuppiesRepository {
  public async findAll(skip: number, take: number, litterId?: string, userId?: string) {
    const baseQuery = `
      SELECT p.*,
        ama.name AS mother_name,
        apa.name AS father_name,
        l.birth_date AS litter_birth_date,
        l.status AS litter_status,
        c.name AS client_name
      FROM puppies p
      LEFT JOIN litters l ON l.id = p.litter_id
      LEFT JOIN animals ama ON ama.id = l.mother_id
      LEFT JOIN animals apa ON apa.id = l.father_id
      LEFT JOIN clients c ON c.id = p.client_id
    `;
    if (litterId) {
      let query = baseQuery + ' WHERE p.litter_id = $1 AND ($2::uuid IS NULL OR p.created_by = $2)';
      const params: any[] = [litterId, userId ?? null];
      query += ' ORDER BY p.created_at ASC';
      const res = await pool.query(query, params);
      return res.rows;
    }
    let query = baseQuery;
    query += ' WHERE ($3::uuid IS NULL OR p.created_by = $3)';
    query += ' ORDER BY p.created_at DESC LIMIT $1 OFFSET $2';
    const params: any[] = [take, skip, userId ?? null];
    const res = await pool.query(query, params);
    return res.rows;
  }
  public async count(userId?: string) {
    let query = 'SELECT COUNT(*) FROM puppies';
    const params: any[] = [userId ?? null];
    query += ' WHERE ($1::uuid IS NULL OR created_by = $1)';
    const res = await pool.query(query, params);
    return parseInt(res.rows[0].count);
  }
  public async findById(id: string, userId?: string) {
    let query = `
      SELECT p.*,
        ama.name AS mother_name,
        apa.name AS father_name,
        l.birth_date AS litter_birth_date,
        l.status AS litter_status,
        c.name AS client_name
      FROM puppies p
      LEFT JOIN litters l ON l.id = p.litter_id
      LEFT JOIN animals ama ON ama.id = l.mother_id
      LEFT JOIN animals apa ON apa.id = l.father_id
      LEFT JOIN clients c ON c.id = p.client_id
      WHERE p.id = $1
    `;
    const params: any[] = [id, userId ?? null];
    query += ' AND ($2::uuid IS NULL OR p.created_by = $2)';
    const res = await pool.query(query, params);
    return res.rows[0] || null;
  }
  public async create(data: any) {
    const res = await pool.query(
      'INSERT INTO puppies (litter_id, name, birth_time, sex, color, weight, microchip, registration_number, price, status, client_id, sale_date, sale_notes, photo_url, created_by, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, CURRENT_TIMESTAMP) RETURNING *',
      [data.litterId, data.name, data.birthTime || null, data.sex, data.color, data.weight, data.microchip, data.registrationNumber, data.price, data.status || 'AVAILABLE', data.clientId, data.saleDate, data.saleNotes, data.photoUrl, data.createdBy]
    );
    return res.rows[0];
  }
  public async update(id: string, data: any, userId?: string) {
    const fields: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (data.litterId !== undefined) { fields.push(`litter_id = $${idx++}`); params.push(data.litterId); }
    if (data.name !== undefined) { fields.push(`name = $${idx++}`); params.push(data.name); }
    if (data.birthTime !== undefined) { fields.push(`birth_time = $${idx++}`); params.push(data.birthTime); }
    if (data.sex !== undefined) { fields.push(`sex = $${idx++}`); params.push(data.sex); }
    if (data.color !== undefined) { fields.push(`color = $${idx++}`); params.push(data.color); }
    if (data.weight !== undefined) { fields.push(`weight = $${idx++}`); params.push(data.weight); }
    if (data.microchip !== undefined) { fields.push(`microchip = $${idx++}`); params.push(data.microchip); }
    if (data.registrationNumber !== undefined) { fields.push(`registration_number = $${idx++}`); params.push(data.registrationNumber); }
    if (data.price !== undefined) { fields.push(`price = $${idx++}`); params.push(data.price); }
    if (data.status !== undefined) { fields.push(`status = $${idx++}`); params.push(data.status); }
    if (data.clientId !== undefined) { fields.push(`client_id = $${idx++}`); params.push(data.clientId); }
    if (data.saleDate !== undefined) { fields.push(`sale_date = $${idx++}`); params.push(data.saleDate); }
    if (data.saleNotes !== undefined) { fields.push(`sale_notes = $${idx++}`); params.push(data.saleNotes); }
    if (data.photoUrl !== undefined) { fields.push(`photo_url = $${idx++}`); params.push(data.photoUrl); }

    if (fields.length === 0) return null;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    params.push(id);
    const idIdx = idx++;
    params.push(userId ?? null);
    const userIdIdx = idx++;

    const res = await pool.query(
      `UPDATE puppies SET ${fields.join(', ')} WHERE id = $${idIdx} AND ($${userIdIdx}::uuid IS NULL OR created_by = $${userIdIdx}) RETURNING *`,
      params
    );
    return res.rows[0];
  }
  public async delete(id: string, userId?: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM financial_transactions WHERE puppy_id = $1', [id]);
      const res = await client.query(
        'DELETE FROM puppies WHERE id = $1 AND ($2::uuid IS NULL OR created_by = $2) RETURNING *',
        [id, userId ?? null]
      );
      await client.query('COMMIT');
      return res.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
