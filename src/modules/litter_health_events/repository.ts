// src/modules/litter_health_events/repository.ts
import { pool } from '../../shared/config/db';
import type { CreateLitterHealthEventInput, UpdateLitterHealthEventInput } from './schema';

export class LitterHealthEventsRepository {
  public async findAll(litterId: string, userId?: string) {
    let sql = `
      SELECT lhe.*,
             EXISTS(
               SELECT 1 FROM financial_transactions ft
               WHERE ft.litter_id = lhe.litter_id
                 AND ft.description LIKE '%#' || lhe.id || ':%'
             ) AS has_transaction
      FROM litter_health_events lhe
      WHERE 1=1
    `;
    const params: any[] = [];
    let i = 1;
    if (litterId) {
      sql += ` AND lhe.litter_id = $${i++}`;
      params.push(litterId);
    }
    sql += ` AND ($${i}::uuid IS NULL OR lhe.created_by = $${i})`;
    params.push(userId ?? null);
    sql += ` ORDER BY lhe.date DESC, lhe.created_at DESC`;
    const result = await pool.query(sql, params);
    return result.rows;
  }

  public async findById(id: string, userId?: string) {
    let sql = `SELECT * FROM litter_health_events WHERE id = $1`;
    const params: any[] = [id];
    sql += ` AND ($2::uuid IS NULL OR created_by = $2)`;
    params.push(userId ?? null);
    const result = await pool.query(sql, params);
    return result.rows[0] || null;
  }

  public async create(data: CreateLitterHealthEventInput & { createdBy?: string }) {
    const sql = `
      INSERT INTO litter_health_events
        (litter_id, type, name, manufacturer, dose, date, next_due_date, amount, notes, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const params = [
      data.litterId,
      data.type,
      data.name,
      data.manufacturer ?? null,
      data.dose ?? null,
      data.date,
      data.nextDueDate ?? null,
      data.amount ?? null,
      data.notes ?? null,
      data.createdBy ?? null,
    ];
    const result = await pool.query(sql, params);
    return result.rows[0];
  }

  public async update(id: string, data: UpdateLitterHealthEventInput, userId?: string) {
    const fields: string[] = [];
    const params: any[] = [];
    let i = 1;

    const allowed: (keyof UpdateLitterHealthEventInput)[] = [
      'type', 'name', 'manufacturer', 'dose', 'date', 'nextDueDate', 'amount', 'notes',
    ];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${i++}`);
        params.push(data[key] ?? null);
      }
    }

    if (fields.length === 0) {
      return this.findById(id, userId);
    }

    params.push(id);
    let sql = `UPDATE litter_health_events SET ${fields.join(', ')} WHERE id = $${i++}`;
    sql += ` AND ($${i}::uuid IS NULL OR created_by = $${i})`;
    params.push(userId ?? null);
    sql += ` RETURNING *`;
    const result = await pool.query(sql, params);
    return result.rows[0] || null;
  }

  public async delete(id: string, userId?: string) {
    let sql = `DELETE FROM litter_health_events WHERE id = $1`;
    const params: any[] = [id];
    sql += ` AND ($2::uuid IS NULL OR created_by = $2)`;
    params.push(userId ?? null);
    const result = await pool.query(sql, params);
    return result.rowCount !== null && result.rowCount > 0;
  }
}
