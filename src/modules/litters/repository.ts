import { pool } from '../../shared/config/db';
import { buildUpdateQuery } from '../../shared/utils/updateHelper';

export class LittersRepository {
  public async findAll(skip: number, take: number, userId?: string) {
    let query = `
      SELECT l.*, 
        mother.name AS mother_name, father.name AS father_name
      FROM litters l
      LEFT JOIN animals mother ON mother.id = l.mother_id
      LEFT JOIN animals father ON father.id = l.father_id
    `;
    query += ` WHERE ($3::uuid IS NULL OR l.created_by = $3)`;
    query += ` ORDER BY l.created_at DESC LIMIT $1 OFFSET $2`;
    const params: any[] = [take, skip, userId ?? null];
    const res = await pool.query(query, params);
    return res.rows;
  }
  public async count(userId?: string) {
    let query = 'SELECT COUNT(*) FROM litters';
    const params: any[] = [];
    query += ' WHERE ($1::uuid IS NULL OR created_by = $1)';
    params.push(userId ?? null);
    const res = await pool.query(query, params);
    return parseInt(res.rows[0].count);
  }
  public async findById(id: string, userId?: string) {
    let query = `
      SELECT l.*, 
        mother.name AS mother_name, father.name AS father_name
      FROM litters l
      LEFT JOIN animals mother ON mother.id = l.mother_id
      LEFT JOIN animals father ON father.id = l.father_id
      WHERE l.id = $1
    `;
    const params: any[] = [id, userId ?? null];
    query += ' AND ($2::uuid IS NULL OR l.created_by = $2)';
    const res = await pool.query(query, params);
    return res.rows[0] || null;
  }
  public async create(data: any) {
    const res = await pool.query(
      'INSERT INTO litters (mother_id, father_id, mating_date, birth_date, expected_date, birth_type, total_puppies, male_count, female_count, status, notes, created_by, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP) RETURNING *',
      [data.motherId, data.fatherId, data.matingDate ? new Date(data.matingDate) : null, data.birthDate ? new Date(data.birthDate) : null, data.expectedDate ? new Date(data.expectedDate) : null, data.birthType || null, data.totalPuppies || null, data.maleCount || null, data.femaleCount || null, data.status || 'PLANNED', data.notes, data.createdBy]
    );
    return res.rows[0];
  }
  public async update(id: string, data: any, userId?: string) {
    // Converter datas antes de passar ao helper (preserva comportamento original)
    const prepared = { ...data };
    if (prepared.matingDate !== undefined) prepared.matingDate = prepared.matingDate ? new Date(prepared.matingDate) : null;
    if (prepared.birthDate !== undefined) prepared.birthDate = prepared.birthDate ? new Date(prepared.birthDate) : null;
    if (prepared.expectedDate !== undefined) prepared.expectedDate = prepared.expectedDate ? new Date(prepared.expectedDate) : null;

    const row = await buildUpdateQuery('litters', id, prepared, {
      motherId: 'mother_id',
      fatherId: 'father_id',
      matingDate: 'mating_date',
      birthDate: 'birth_date',
      expectedDate: 'expected_date',
      birthType: 'birth_type',
      totalPuppies: 'total_puppies',
      maleCount: 'male_count',
      femaleCount: 'female_count',
      status: 'status',
      notes: 'notes',
    }, userId);
    return row;
  }
  public async delete(id: string, userId?: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM financial_transactions WHERE litter_id = $1', [id]);
      const res = await client.query(
        'DELETE FROM litters WHERE id = $1 AND ($2::uuid IS NULL OR created_by = $2) RETURNING *',
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
