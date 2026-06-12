import { pool } from '../../../shared/config/db';

export const weightRepository = {
  async findWeightHistory(animalId: string, userId?: string) {
    const res = await pool.query(
      'SELECT * FROM weight_history WHERE animal_id = $1 AND ($2::uuid IS NULL OR created_by = $2) ORDER BY date ASC',
      [animalId, userId ?? null]
    );
    return res.rows;
  },

  async findWeightById(id: string, userId?: string) {
    const res = await pool.query('SELECT * FROM weight_history WHERE id = $1 AND ($2::uuid IS NULL OR created_by = $2)', [id, userId ?? null]);
    return res.rows[0] || null;
  },

  async createWeight(data: any) {
    const res = await pool.query(
      `INSERT INTO weight_history (animal_id, weight, date, notes, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [data.animalId, data.weight, data.date || new Date(), data.notes, data.createdBy]
    );
    return res.rows[0];
  },

  async deleteWeight(id: string, userId?: string) {
    const res = await pool.query('DELETE FROM weight_history WHERE id = $1 AND ($2::uuid IS NULL OR created_by = $2) RETURNING *', [id, userId ?? null]);
    return res.rows[0];
  },
};
