import { pool } from '../../../shared/config/db';
import { buildUpdateQuery } from '../../../shared/utils/updateHelper';

export const dewormingRepository = {
  async findDewormingByAnimal(animalId: string, userId?: string) {
    const res = await pool.query(
      'SELECT * FROM deworming WHERE animal_id = $1 AND ($2::uuid IS NULL OR created_by = $2) ORDER BY date DESC',
      [animalId, userId ?? null]
    );
    return res.rows;
  },

  async findDewormingById(id: string, userId?: string) {
    const res = await pool.query('SELECT * FROM deworming WHERE id = $1 AND ($2::uuid IS NULL OR created_by = $2)', [id, userId ?? null]);
    return res.rows[0] || null;
  },

  async createDeworming(data: any) {
    const res = await pool.query(
      `INSERT INTO deworming (animal_id, product, active_ingredient, dose, weight_at_date, date, next_due_date, vet_name, notes, created_by, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
       RETURNING *`,
      [data.animalId, data.product, data.activeIngredient, data.dose,
       data.weightAtDate, data.date, data.nextDueDate, data.vetName, data.notes, data.createdBy]
    );
    return res.rows[0];
  },

  async updateDeworming(id: string, data: any, userId?: string) {
    const row = await buildUpdateQuery('deworming', id, data, {
      product: 'product',
      activeIngredient: 'active_ingredient',
      dose: 'dose',
      weightAtDate: 'weight_at_date',
      date: 'date',
      nextDueDate: 'next_due_date',
      vetName: 'vet_name',
      notes: 'notes',
    }, userId);
    return row;
  },

  async deleteDeworming(id: string, userId?: string) {
    const res = await pool.query('DELETE FROM deworming WHERE id = $1 AND ($2::uuid IS NULL OR created_by = $2) RETURNING *', [id, userId ?? null]);
    return res.rows[0];
  },
};
