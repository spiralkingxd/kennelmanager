// src/modules/notifications/repository.ts
// Data access para `notifications`. Aplica o NULL guard pattern de
// isolamento multi-tenant por userId (ADMIN → undefined → null → vê todos).
import { pool } from '../../shared/config/db';
import type { CreateNotificationInput, NotificationType } from './schema';

export interface NotificationFilters {
  type?: NotificationType;
  unreadOnly?: boolean;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  description: string | null;
  reference_type: string | null;
  reference_id: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export class NotificationRepository {
  public async findAll(
    skip: number,
    take: number,
    userId?: string,
    filters?: NotificationFilters,
  ): Promise<NotificationRow[]> {
    let sql = `SELECT n.* FROM notifications n`;
    const params: any[] = [];
    const conditions: string[] = [];
    let i = 1;

    // NULL guard: ADMIN (userId undefined → null) vê todos
    conditions.push(`($${i}::uuid IS NULL OR n.user_id = $${i})`);
    params.push(userId ?? null);
    i++;

    if (filters?.type) {
      conditions.push(`n.type = $${i++}`);
      params.push(filters.type);
    }
    if (filters?.unreadOnly) {
      conditions.push(`n.is_read = FALSE`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ` ORDER BY n.created_at DESC LIMIT $${i} OFFSET $${i + 1}`;
    params.push(take, skip);

    const result = await pool.query(sql, params);
    return result.rows;
  }

  public async count(userId?: string, filters?: NotificationFilters): Promise<number> {
    let sql = 'SELECT COUNT(*) FROM notifications n';
    const params: any[] = [];
    const conditions: string[] = [];
    let i = 1;

    // NULL guard idêntico ao findAll — mantém consistência
    conditions.push(`($${i}::uuid IS NULL OR n.user_id = $${i})`);
    params.push(userId ?? null);
    i++;

    if (filters?.type) {
      conditions.push(`n.type = $${i++}`);
      params.push(filters.type);
    }
    if (filters?.unreadOnly) {
      conditions.push(`n.is_read = FALSE`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    const result = await pool.query(sql, params);
    return parseInt(result.rows[0].count, 10);
  }

  public async findById(id: string, userId?: string): Promise<NotificationRow | null> {
    const sql = `SELECT n.* FROM notifications n WHERE n.id = $1 AND ($2::uuid IS NULL OR n.user_id = $2)`;
    const result = await pool.query(sql, [id, userId ?? null]);
    return result.rows[0] || null;
  }

  public async create(data: CreateNotificationInput): Promise<NotificationRow> {
    const sql = `
      INSERT INTO notifications (user_id, type, title, description, reference_type, reference_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const params = [
      data.userId,
      data.type,
      data.title,
      data.description ?? null,
      data.referenceType ?? null,
      data.referenceId ?? null,
    ];
    const result = await pool.query(sql, params);
    return result.rows[0];
  }

  public async markAsRead(id: string, userId?: string): Promise<NotificationRow | null> {
    const sql = `
      UPDATE notifications n
      SET is_read = TRUE, read_at = NOW()
      WHERE n.id = $1
        AND ($2::uuid IS NULL OR n.user_id = $2)
      RETURNING *
    `;
    const result = await pool.query(sql, [id, userId ?? null]);
    return result.rows[0] || null;
  }

  public async markAllAsRead(userId: string): Promise<number> {
    // Não usa NULL guard: marca apenas as notificações do próprio usuário.
    const sql = `
      UPDATE notifications
      SET is_read = TRUE, read_at = NOW()
      WHERE user_id = $1 AND is_read = FALSE
    `;
    const result = await pool.query(sql, [userId]);
    return result.rowCount ?? 0;
  }

  public async delete(id: string, userId?: string): Promise<boolean> {
    const sql = `DELETE FROM notifications n WHERE n.id = $1 AND ($2::uuid IS NULL OR n.user_id = $2)`;
    const result = await pool.query(sql, [id, userId ?? null]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}
