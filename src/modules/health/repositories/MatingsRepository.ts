import { pool } from '../../../shared/config/db';
import { buildUpdateQuery } from './updateHelper';

export const matingsRepository = {
  async findMatingsByFemale(femaleId: string, userId?: string) {
    const res = await pool.query(
      `SELECT m.*, a.name AS male_name
       FROM matings m
       LEFT JOIN animals a ON a.id = m.male_id
       WHERE m.female_id = $1 AND ($2::uuid IS NULL OR m.created_by = $2)
       ORDER BY m.date DESC`,
      [femaleId, userId ?? null]
    );
    return res.rows;
  },

  async findMatingById(id: string, userId?: string) {
    const res = await pool.query(
      `SELECT m.*, a.name AS male_name
       FROM matings m
       LEFT JOIN animals a ON a.id = m.male_id
       WHERE m.id = $1 AND ($2::uuid IS NULL OR m.created_by = $2)`,
      [id, userId ?? null]
    );
    return res.rows[0] || null;
  },

  async createMating(data: any) {
    const res = await pool.query(
      `INSERT INTO matings (female_id, male_id, type, date, result, litter_id, notes, created_by, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
       RETURNING *`,
      [data.femaleId, data.maleId, data.type || 'NATURAL', data.date,
       data.result, data.litterId, data.notes, data.createdBy]
    );
    return res.rows[0];
  },

  async updateMating(id: string, data: any, userId?: string) {
    const row = await buildUpdateQuery('matings', id, data, {
      type: 'type',
      date: 'date',
      result: 'result',
      litterId: 'litter_id',
      notes: 'notes',
    }, userId);
    return row;
  },

  async deleteMating(id: string, userId?: string) {
    const res = await pool.query('DELETE FROM matings WHERE id = $1 AND ($2::uuid IS NULL OR created_by = $2) RETURNING *', [id, userId ?? null]);
    return res.rows[0];
  },
};
