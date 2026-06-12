import { pool } from '../../shared/config/db';
import { buildUpdateQuery } from '../../shared/utils/updateHelper';

export class MessageTemplateRepository {
  public async findAll(skip: number, take: number, filters?: { category?: string; isActive?: boolean }, userId?: string) {
    let query = 'SELECT id, name, subject, body, category, variables, is_active, created_by, created_at, updated_at FROM message_templates';
    const params: any[] = [];
    const conditions: string[] = [];
    let paramIndex = 1;

    if (filters?.category) {
      conditions.push(`category = $${paramIndex++}`);
      params.push(filters.category);
    }
    if (filters?.isActive !== undefined) {
      conditions.push(`is_active = $${paramIndex++}`);
      params.push(filters.isActive);
    }

    conditions.push(`($${paramIndex}::uuid IS NULL OR created_by = $${paramIndex})`);
    params.push(userId ?? null);
    paramIndex++;

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY name ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(take, skip);

    const res = await pool.query(query, params);
    return res.rows;
  }

  public async count(filters?: { category?: string; isActive?: boolean }, userId?: string) {
    let query = 'SELECT COUNT(*) FROM message_templates';
    const params: any[] = [];
    const conditions: string[] = [];
    let paramIndex = 1;

    if (filters?.category) {
      conditions.push(`category = $${paramIndex++}`);
      params.push(filters.category);
    }
    if (filters?.isActive !== undefined) {
      conditions.push(`is_active = $${paramIndex++}`);
      params.push(filters.isActive);
    }

    conditions.push(`($${paramIndex}::uuid IS NULL OR created_by = $${paramIndex})`);
    params.push(userId ?? null);
    paramIndex++;

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const res = await pool.query(query, params);
    return parseInt(res.rows[0].count, 10);
  }

  public async findById(id: string, userId?: string) {
    const query = 'SELECT id, name, subject, body, category, variables, is_active, created_by, created_at, updated_at FROM message_templates WHERE id = $1 AND ($2::uuid IS NULL OR created_by = $2)';
    const params: any[] = [id, userId ?? null];
    const res = await pool.query(query, params);
    return res.rows[0] || null;
  }

  public async create(data: any) {
    const res = await pool.query(
      `INSERT INTO message_templates (name, subject, body, category, variables, is_active, created_by, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP) RETURNING *`,
      [data.name, data.subject || null, data.body, data.category || null, data.variables || [], data.isActive ?? true, data.createdBy]
    );
    return res.rows[0];
  }

  public async update(id: string, data: any, userId?: string) {
    const row = await buildUpdateQuery('message_templates', id, data, {
      name: 'name',
      subject: 'subject',
      body: 'body',
      category: 'category',
      variables: 'variables',
      isActive: 'is_active',
    }, userId);
    return row;
  }

  public async delete(id: string, userId?: string) {
    const query = 'DELETE FROM message_templates WHERE id = $1 AND ($2::uuid IS NULL OR created_by = $2) RETURNING *';
    const params: any[] = [id, userId ?? null];
    const res = await pool.query(query, params);
    return res.rows[0];
  }
}
