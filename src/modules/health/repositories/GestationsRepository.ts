import { pool } from '../../../shared/config/db';
import { buildUpdateQuery } from './updateHelper';

export const gestationsRepository = {
  async findGestationsByAnimal(animalId: string, userId?: string) {
    const res = await pool.query(
      'SELECT * FROM gestations WHERE animal_id = $1 AND ($2::uuid IS NULL OR created_by = $2) ORDER BY start_date DESC',
      [animalId, userId ?? null]
    );
    return res.rows;
  },

  async findActiveGestation(animalId: string, userId?: string) {
    const res = await pool.query(
      'SELECT * FROM gestations WHERE animal_id = $1 AND is_active = true AND ($2::uuid IS NULL OR created_by = $2) ORDER BY start_date DESC LIMIT 1',
      [animalId, userId ?? null]
    );
    return res.rows[0] || null;
  },

  async findGestationById(id: string, userId?: string) {
    const res = await pool.query('SELECT * FROM gestations WHERE id = $1 AND ($2::uuid IS NULL OR created_by = $2)', [id, userId ?? null]);
    return res.rows[0] || null;
  },

  async createGestation(data: any) {
    const res = await pool.query(
      `INSERT INTO gestations (animal_id, mating_id, start_date, expected_birth_date, actual_birth_date,
        estimated_puppies, progress_week, is_active, litter_id, notes, created_by, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
       RETURNING *`,
      [data.animalId, data.matingId, data.startDate, data.expectedBirthDate,
       data.actualBirthDate, data.estimatedPuppies, data.progressWeek || 0,
       data.isActive !== false, data.litterId, data.notes, data.createdBy]
    );
    return res.rows[0];
  },

  async updateGestation(id: string, data: any, userId?: string) {
    const row = await buildUpdateQuery('gestations', id, data, {
      startDate: 'start_date',
      expectedBirthDate: 'expected_birth_date',
      actualBirthDate: 'actual_birth_date',
      estimatedPuppies: 'estimated_puppies',
      progressWeek: 'progress_week',
      isActive: 'is_active',
      notes: 'notes',
      litterId: 'litter_id',
    }, userId);
    // Se nenhum campo foi fornecido, retornar registro atual
    if (!row) return this.findGestationById(id, userId);
    return row;
  },

  async deleteGestation(id: string, userId?: string) {
    const res = await pool.query('DELETE FROM gestations WHERE id = $1 AND ($2::uuid IS NULL OR created_by = $2) RETURNING *', [id, userId ?? null]);
    return res.rows[0];
  },
};
