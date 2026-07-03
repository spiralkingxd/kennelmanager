import { pool } from '../../../shared/config/db';
import { buildUpdateQuery } from '../../../shared/utils/updateHelper';

export const heatCyclesRepository = {
  async findHeatCyclesByAnimal(animalId: string, userId?: string) {
    const res = await pool.query(
      'SELECT * FROM heat_cycles WHERE animal_id = $1 AND ($2::uuid IS NULL OR created_by = $2) ORDER BY start_date DESC',
      [animalId, userId ?? null]
    );
    return res.rows;
  },

  async findHeatCycleById(id: string, userId?: string) {
    const res = await pool.query('SELECT * FROM heat_cycles WHERE id = $1 AND ($2::uuid IS NULL OR created_by = $2)', [id, userId ?? null]);
    return res.rows[0] || null;
  },

  async createHeatCycle(data: any) {
    const res = await pool.query(
      `INSERT INTO heat_cycles (animal_id, start_date, end_date, intensity, was_mated, notes, created_by, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
       RETURNING *`,
      [data.animalId, data.startDate, data.endDate, data.intensity,
       data.wasMated || false, data.notes, data.createdBy]
    );
    return res.rows[0];
  },

  async updateHeatCycle(id: string, data: any, userId?: string) {
    const row = await buildUpdateQuery('heat_cycles', id, data, {
      startDate: 'start_date',
      endDate: 'end_date',
      intensity: 'intensity',
      wasMated: 'was_mated',
      notes: 'notes',
    }, userId);
    return row;
  },

  async deleteHeatCycle(id: string, userId?: string) {
    const res = await pool.query('DELETE FROM heat_cycles WHERE id = $1 AND ($2::uuid IS NULL OR created_by = $2) RETURNING *', [id, userId ?? null]);
    return res.rows[0];
  },
};
