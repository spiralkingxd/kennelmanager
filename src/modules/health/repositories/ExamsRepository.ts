import { pool } from '../../../shared/config/db';
import { buildUpdateQuery } from '../../../shared/utils/updateHelper';

export const examsRepository = {
  async findExamsByAnimal(animalId: string, userId?: string) {
    const res = await pool.query(
      'SELECT * FROM exams WHERE animal_id = $1 AND ($2::uuid IS NULL OR created_by = $2) ORDER BY date DESC',
      [animalId, userId ?? null]
    );
    return res.rows;
  },

  async findExamById(id: string, userId?: string) {
    const res = await pool.query('SELECT * FROM exams WHERE id = $1 AND ($2::uuid IS NULL OR created_by = $2)', [id, userId ?? null]);
    return res.rows[0] || null;
  },

  async createExam(data: any) {
    const res = await pool.query(
      `INSERT INTO exams (animal_id, type, date, result, result_file_url, vet_name, clinic, is_pre_reproduction, notes, created_by, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
       RETURNING *`,
      [data.animalId, data.type, data.date, data.result, data.resultFileUrl,
       data.vetName, data.clinic, data.isPreReproduction || false, data.notes, data.createdBy]
    );
    return res.rows[0];
  },

  async updateExam(id: string, data: any, userId?: string) {
    const row = await buildUpdateQuery('exams', id, data, {
      type: 'type',
      date: 'date',
      result: 'result',
      resultFileUrl: 'result_file_url',
      vetName: 'vet_name',
      clinic: 'clinic',
      isPreReproduction: 'is_pre_reproduction',
      notes: 'notes',
    }, userId);
    return row;
  },

  async deleteExam(id: string, userId?: string) {
    const res = await pool.query('DELETE FROM exams WHERE id = $1 AND ($2::uuid IS NULL OR created_by = $2) RETURNING *', [id, userId ?? null]);
    return res.rows[0];
  },
};
