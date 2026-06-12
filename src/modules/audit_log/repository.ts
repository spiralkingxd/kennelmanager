import { pool } from '../../shared/config/db';

export interface AuditFilters {
  entityType?: string;
  action?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export class AuditLogRepository {
  public async findAll(skip: number, take: number, userId?: string, filters?: AuditFilters) {
    let query = `
      SELECT al.*,
        u.name AS user_name
      FROM audit_log al
      LEFT JOIN users u ON u.id = al.user_id
    `;
    const params: any[] = [];
    const conditions: string[] = [];
    let paramIndex = 1;

    // Filter by user: NULL guard pattern (admins see all, users see only their own)
    conditions.push(`($${paramIndex}::uuid IS NULL OR al.user_id = $${paramIndex})`);
    params.push(userId ?? null);
    paramIndex++;

    if (filters?.entityType) {
      conditions.push(`al.entity_type = $${paramIndex++}`);
      params.push(filters.entityType);
    }
    if (filters?.action) {
      conditions.push(`al.action = $${paramIndex++}`);
      params.push(filters.action);
    }
    if (filters?.userId) {
      conditions.push(`al.user_id = $${paramIndex++}`);
      params.push(filters.userId);
    }
    if (filters?.startDate) {
      conditions.push(`al.created_at >= $${paramIndex++}`);
      params.push(new Date(filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(`al.created_at <= $${paramIndex++}`);
      params.push(new Date(filters.endDate));
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY al.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(take, skip);

    const res = await pool.query(query, params);
    return res.rows;
  }

  public async count(userId?: string, filters?: AuditFilters) {
    let query = 'SELECT COUNT(*) FROM audit_log al';
    const params: any[] = [];
    const conditions: string[] = [];
    let paramIndex = 1;

    // Filter by user: NULL guard pattern (admins see all, users see only their own)
    conditions.push(`($${paramIndex}::uuid IS NULL OR al.user_id = $${paramIndex})`);
    params.push(userId ?? null);
    paramIndex++;

    if (filters?.entityType) {
      conditions.push(`al.entity_type = $${paramIndex++}`);
      params.push(filters.entityType);
    }
    if (filters?.action) {
      conditions.push(`al.action = $${paramIndex++}`);
      params.push(filters.action);
    }
    if (filters?.userId) {
      conditions.push(`al.user_id = $${paramIndex++}`);
      params.push(filters.userId);
    }
    if (filters?.startDate) {
      conditions.push(`al.created_at >= $${paramIndex++}`);
      params.push(new Date(filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(`al.created_at <= $${paramIndex++}`);
      params.push(new Date(filters.endDate));
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const res = await pool.query(query, params);
    return parseInt(res.rows[0].count, 10);
  }

  public async findById(id: string, userId?: string) {
    const query = `
      SELECT al.*,
        u.name AS user_name
      FROM audit_log al
      LEFT JOIN users u ON u.id = al.user_id
      WHERE al.id = $1 AND ($2::uuid IS NULL OR al.user_id = $2)`;
    const params: any[] = [id, userId ?? null];
    const res = await pool.query(query, params);
    return res.rows[0] || null;
  }

  public async create(data: any) {
    const res = await pool.query(
      `INSERT INTO audit_log (user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [data.userId, data.action, data.entityType, data.entityId || null, data.oldValues ? JSON.stringify(data.oldValues) : null, data.newValues ? JSON.stringify(data.newValues) : null, data.ipAddress || null, data.userAgent || null]
    );
    return res.rows[0];
  }
}
