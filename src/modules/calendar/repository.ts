import { pool } from '../../shared/config/db';

// Base columns needed for list/detail queries (with JOINs for display names)
const EVENT_SELECT_COLUMNS = `
  ce.id, ce.title, ce.date, ce.time, ce.end_time, ce.category,
  ce.description, ce.is_automatic, ce.color, ce.status,
  ce.animal_id, ce.client_id, ce.user_id, ce.created_by,
  ce.created_at, ce.updated_at,
  a.name AS animal_name,
  c.name AS client_name
`;

export class CalendarRepository {
  public async findAll(skip: number, take: number, userId?: string) {
    const res = await pool.query(
      `SELECT ${EVENT_SELECT_COLUMNS}
       FROM calendar_events ce
       LEFT JOIN animals a ON a.id = ce.animal_id
       LEFT JOIN clients c ON c.id = ce.client_id
       WHERE ($3::uuid IS NULL OR ce.created_by = $3)
       ORDER BY ce.date DESC, ce.time ASC NULLS LAST
       LIMIT $1 OFFSET $2`,
      [take, skip, userId ?? null]
    );
    return res.rows;
  }

  public async count(userId?: string) {
    const query = 'SELECT COUNT(*) FROM calendar_events WHERE ($1::uuid IS NULL OR created_by = $1)';
    const params: any[] = [userId ?? null];
    const res = await pool.query(query, params);
    return parseInt(res.rows[0].count, 10);
  }

  public async findById(id: string, userId?: string) {
    const res = await pool.query(
      `SELECT ${EVENT_SELECT_COLUMNS}
       FROM calendar_events ce
       LEFT JOIN animals a ON a.id = ce.animal_id
       LEFT JOIN clients c ON c.id = ce.client_id
       WHERE ce.id = $1 AND ($2::uuid IS NULL OR ce.created_by = $2)`,
      [id, userId ?? null]
    );
    return res.rows[0] || null;
  }

  public async create(data: any) {
    const res = await pool.query(
      `INSERT INTO calendar_events
        (title, date, time, end_time, category, description, is_automatic, color, status,
         animal_id, client_id, user_id, created_by, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        data.title,
        data.date || null,
        data.time || null,
        data.endTime || null,
        data.category,
        data.description || null,
        data.isAutomatic ?? false,
        data.color || null,
        data.status || 'PENDING',
        data.animalId || null,
        data.clientId || null,
        data.userId || null,
        data.createdBy || null,
      ]
    );
    return res.rows[0];
  }

  public async update(id: string, data: any, userId?: string) {
    // Build SET clause dynamically for non-nullish fields only
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const fieldMap: Record<string, string> = {
      title: 'title',
      date: 'date',
      time: 'time',
      endTime: 'end_time',
      category: 'category',
      description: 'description',
      isAutomatic: 'is_automatic',
      color: 'color',
      status: 'status',
      animalId: 'animal_id',
      clientId: 'client_id',
      userId: 'user_id',
    };

    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) {
        fields.push(`${col} = $${paramIndex}`);
        // isAutomatic: pass value as-is to preserve the flag when editing
        // auto-created events (schema accepts boolean | null | undefined).
        // The `?? false` fallback would silently drop the flag for any
        // explicitly-provided non-true value (including null).
        values.push(
          key === 'date' ? data[key] || null :
          key === 'isAutomatic' ? data[key] :
          key === 'status' ? data[key] || 'PENDING' :
          data[key]
        );
        paramIndex++;
      }
    }

    if (fields.length === 0) return this.findById(id, userId);

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    const idParam = paramIndex;
    paramIndex++;
    values.push(userId);

    const res = await pool.query(
      `UPDATE calendar_events SET ${fields.join(', ')} WHERE id = $${idParam} AND ($${paramIndex}::uuid IS NULL OR created_by = $${paramIndex}) RETURNING *`,
      values
    );
    return res.rows[0];
  }

  public async delete(id: string, userId?: string) {
    const res = await pool.query('DELETE FROM calendar_events WHERE id = $1 AND ($2::uuid IS NULL OR created_by = $2) RETURNING *', [id, userId ?? null]);
    return res.rows[0];
  }
}
