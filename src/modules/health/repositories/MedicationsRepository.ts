import { pool } from '../../../shared/config/db';
import { buildUpdateQuery } from './updateHelper';

export const medicationsRepository = {
  async findMedicationsByAnimal(animalId: string, userId?: string) {
    const res = await pool.query(
      'SELECT * FROM medications WHERE animal_id = $1 AND ($2::uuid IS NULL OR created_by = $2) ORDER BY start_date DESC',
      [animalId, userId ?? null]
    );
    return res.rows;
  },

  async findMedicationById(id: string, userId?: string) {
    const res = await pool.query('SELECT * FROM medications WHERE id = $1 AND ($2::uuid IS NULL OR created_by = $2)', [id, userId ?? null]);
    return res.rows[0] || null;
  },

  async createMedication(data: any) {
    const res = await pool.query(
      `INSERT INTO medications (animal_id, name, dose, route, frequency, start_date, end_date, notes, status, created_by, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
       RETURNING *`,
      [data.animalId, data.name, data.dose, data.route, data.frequency,
       data.startDate, data.endDate, data.notes, data.status || 'ACTIVE', data.createdBy]
    );
    return res.rows[0];
  },

  async updateMedication(id: string, data: any, userId?: string) {
    const row = await buildUpdateQuery('medications', id, data, {
      name: 'name',
      dose: 'dose',
      route: 'route',
      frequency: 'frequency',
      startDate: 'start_date',
      endDate: 'end_date',
      notes: 'notes',
      status: 'status',
    }, userId);
    return row;
  },

  async deleteMedication(id: string, userId?: string) {
    const res = await pool.query('DELETE FROM medications WHERE id = $1 AND ($2::uuid IS NULL OR created_by = $2) RETURNING *', [id, userId ?? null]);
    return res.rows[0];
  },
};
