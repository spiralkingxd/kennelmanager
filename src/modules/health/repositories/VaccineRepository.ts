import { pool } from '../../../shared/config/db';
import { buildUpdateQuery } from './updateHelper';

export const vaccineRepository = {
  async findVaccinesByAnimal(animalId: string, userId?: string) {
    const res = await pool.query(
      'SELECT * FROM vaccines WHERE animal_id = $1 AND ($2::uuid IS NULL OR created_by = $2) ORDER BY date DESC',
      [animalId, userId ?? null]
    );
    return res.rows;
  },

  async findVaccineById(id: string, userId?: string) {
    const res = await pool.query('SELECT * FROM vaccines WHERE id = $1 AND ($2::uuid IS NULL OR created_by = $2)', [id, userId ?? null]);
    return res.rows[0] || null;
  },

  async createVaccine(data: any) {
    const res = await pool.query(
      `INSERT INTO vaccines (animal_id, name, manufacturer, batch, dose, date, next_due_date, vet_name, clinic, notes, created_by, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
       RETURNING *`,
      [data.animalId, data.name, data.manufacturer, data.batch, data.dose,
       data.date, data.nextDueDate, data.vetName, data.clinic, data.notes, data.createdBy]
    );
    return res.rows[0];
  },

  async updateVaccine(id: string, data: any, userId?: string) {
    const row = await buildUpdateQuery('vaccines', id, data, {
      name: 'name',
      manufacturer: 'manufacturer',
      batch: 'batch',
      dose: 'dose',
      date: 'date',
      nextDueDate: 'next_due_date',
      vetName: 'vet_name',
      clinic: 'clinic',
      notes: 'notes',
    }, userId);
    return row;
  },

  async deleteVaccine(id: string, userId?: string) {
    const res = await pool.query('DELETE FROM vaccines WHERE id = $1 AND ($2::uuid IS NULL OR created_by = $2) RETURNING *', [id, userId ?? null]);
    return res.rows[0];
  },
};
