import { pool } from '../../../shared/config/db';
import { buildUpdateQuery } from '../../../shared/utils/updateHelper';

export const consultationsRepository = {
  async findConsultationsByAnimal(animalId: string, userId?: string) {
    const res = await pool.query(
      'SELECT * FROM consultations WHERE animal_id = $1 AND ($2::uuid IS NULL OR created_by = $2) ORDER BY date DESC',
      [animalId, userId ?? null]
    );
    return res.rows;
  },

  async findConsultationById(id: string, userId?: string) {
    const res = await pool.query('SELECT * FROM consultations WHERE id = $1 AND ($2::uuid IS NULL OR created_by = $2)', [id, userId ?? null]);
    return res.rows[0] || null;
  },

  async createConsultation(data: any) {
    const res = await pool.query(
      `INSERT INTO consultations (animal_id, date, reason, diagnosis, treatment, medications, value, vet_name, clinic, notes, created_by, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
       RETURNING *`,
      [data.animalId, data.date, data.reason, data.diagnosis, data.treatment,
       data.medications, data.value, data.vetName, data.clinic, data.notes, data.createdBy]
    );
    return res.rows[0];
  },

  async updateConsultation(id: string, data: any, userId?: string) {
    const row = await buildUpdateQuery('consultations', id, data, {
      date: 'date',
      reason: 'reason',
      diagnosis: 'diagnosis',
      treatment: 'treatment',
      medications: 'medications',
      value: 'value',
      vetName: 'vet_name',
      clinic: 'clinic',
      notes: 'notes',
    }, userId);
    return row;
  },

  async deleteConsultation(id: string, userId?: string) {
    const res = await pool.query('DELETE FROM consultations WHERE id = $1 AND ($2::uuid IS NULL OR created_by = $2) RETURNING *', [id, userId ?? null]);
    return res.rows[0];
  },
};
