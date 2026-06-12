import { pool } from '../../shared/config/db';

export class WaitlistRepository {
  public async findAll(skip: number, take: number, userId?: string) {
    const res = await pool.query(`
      SELECT w.*,
        c.name AS client_name, c.phone AS client_phone, c.email AS client_email
      FROM waitlist w
      LEFT JOIN clients c ON c.id = w.client_id
      WHERE ($3::uuid IS NULL OR w.created_by = $3)
      ORDER BY w.created_at DESC LIMIT $1 OFFSET $2
    `, [take, skip, userId ?? null]);
    return res.rows;
  }
  public async count(userId?: string) {
    const res = await pool.query('SELECT COUNT(*) FROM waitlist WHERE ($1::uuid IS NULL OR created_by = $1)', [userId ?? null]);
    return parseInt(res.rows[0].count);
  }
  public async findById(id: string, userId?: string) {
    const res = await pool.query(`
      SELECT w.*,
        c.name AS client_name, c.phone AS client_phone, c.email AS client_email
      FROM waitlist w
      LEFT JOIN clients c ON c.id = w.client_id
      WHERE w.id = $1 AND ($2::uuid IS NULL OR w.created_by = $2)
    `, [id, userId ?? null]);
    return res.rows[0] || null;
  }
  public async create(data: any) {
    const res = await pool.query(
      `INSERT INTO waitlist (client_id, preferred_breed, preferred_gender, preferred_color, max_price, notes, status, created_by, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP) RETURNING *`,
      [data.clientId, data.preferredBreed || null, data.preferredGender || null, data.preferredColor || null, data.maxPrice || null, data.notes || null, data.status || 'ACTIVE', data.createdBy]
    );
    return res.rows[0];
  }
  public async update(id: string, data: any, userId?: string) {
    const fields: string[] = [];
    const params: any[] = [];
    let i = 1;

    const allowed = ['clientId', 'preferredBreed', 'preferredGender', 'preferredColor', 'maxPrice', 'notes', 'status'] as const;
    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = $${i++}`);
        params.push(data[key] ?? null);
      }
    }

    if (fields.length === 0) {
      return this.findById(id, userId);
    }

    params.push(id);
    let sql = `UPDATE waitlist SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${i++}`;
    sql += ` AND ($${i}::uuid IS NULL OR created_by = $${i})`;
    params.push(userId ?? null);
    sql += ' RETURNING *';

    const res = await pool.query(sql, params);
    return res.rows[0];
  }
  public async delete(id: string, userId?: string) {
    const res = await pool.query('DELETE FROM waitlist WHERE id = $1 AND ($2::uuid IS NULL OR created_by = $2) RETURNING *', [id, userId ?? null]);
    return res.rows[0];
  }
  public async findMatches(id: string, userId?: string) {
    // Busca a entry da waitlist para pegar preferências
    const entry = await this.findById(id, userId);
    if (!entry) return [];

    // Busca filhotes AVAILABLE que batem com as preferências
    // Isolamento multi-tenant: filtra por created_by do filhote OU da ninhada.
    // NULL guard garante que ADMIN (userId=undefined → null) vê tudo.
    const res = await pool.query(`
      SELECT p.id, COALESCE(p.name, p.color, 'Filhote') AS puppy_name, p.sex, p.color, p.price,
        l.id AS litter_id,
        a.name AS mother_name,
        a.breed AS breed
      FROM puppies p
      JOIN litters l ON l.id = p.litter_id
      JOIN animals a ON a.id = l.mother_id
      WHERE p.status = 'AVAILABLE'
        AND ($1::text IS NULL OR $1 = '' OR a.breed ILIKE '%' || $1 || '%')
        AND ($2::animal_sex IS NULL OR p.sex = $2)
        AND ($3::text IS NULL OR $3 = '' OR p.color ILIKE '%' || $3 || '%')
        AND ($4::numeric IS NULL OR p.price IS NULL OR p.price <= $4)
        AND ($5::uuid IS NULL OR p.created_by = $5 OR l.created_by = $5)
      ORDER BY p.created_at DESC
      LIMIT 20
    `, [entry.preferred_breed, entry.preferred_gender, entry.preferred_color, entry.max_price, userId ?? null]);
    return res.rows;
  }
}
