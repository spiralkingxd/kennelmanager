import { pool } from '../../shared/config/db';
import { buildUpdateQuery } from '../../shared/utils/updateHelper';

export class InstallmentRepository {
  public async findAll(skip: number, take: number, filters?: { transactionId?: string; status?: string }, userId?: string) {
    let query = `
      SELECT i.*,
        ft.type AS transaction_type, ft.description AS transaction_description,
        ft.amount AS transaction_amount, ft.date AS transaction_date
      FROM installments i
      LEFT JOIN financial_transactions ft ON ft.id = i.transaction_id
    `;
    const params: any[] = [];
    const conditions: string[] = [];
    let paramIndex = 1;

    if (filters?.transactionId) {
      conditions.push(`i.transaction_id = $${paramIndex++}`);
      params.push(filters.transactionId);
    }
    if (filters?.status) {
      conditions.push(`i.status = $${paramIndex++}`);
      params.push(filters.status);
    }

    conditions.push(`($${paramIndex}::uuid IS NULL OR i.created_by = $${paramIndex})`);
    params.push(userId ?? null);
    paramIndex++;

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY i.due_date ASC, i.installment_number ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(take, skip);

    const res = await pool.query(query, params);
    return res.rows;
  }

  public async count(filters?: { transactionId?: string; status?: string }, userId?: string) {
    let query = 'SELECT COUNT(*) FROM installments i';
    const params: any[] = [];
    const conditions: string[] = [];
    let paramIndex = 1;

    if (filters?.transactionId) {
      conditions.push(`i.transaction_id = $${paramIndex++}`);
      params.push(filters.transactionId);
    }
    if (filters?.status) {
      conditions.push(`i.status = $${paramIndex++}`);
      params.push(filters.status);
    }

    conditions.push(`($${paramIndex}::uuid IS NULL OR i.created_by = $${paramIndex})`);
    params.push(userId ?? null);
    paramIndex++;

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const res = await pool.query(query, params);
    return parseInt(res.rows[0].count, 10);
  }

  public async findById(id: string, userId?: string) {
    const query = `
      SELECT i.*,
        ft.type AS transaction_type, ft.description AS transaction_description,
        ft.amount AS transaction_amount, ft.date AS transaction_date
      FROM installments i
      LEFT JOIN financial_transactions ft ON ft.id = i.transaction_id
      WHERE i.id = $1 AND ($2::uuid IS NULL OR i.created_by = $2)
    `;
    const params: any[] = [id, userId ?? null];
    const res = await pool.query(query, params);
    return res.rows[0] || null;
  }

  public async create(data: any) {
    const res = await pool.query(
      `INSERT INTO installments (transaction_id, installment_number, amount, due_date, paid_date, paid_amount, status, notes, created_by, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP) RETURNING *`,
      [data.transactionId, data.installmentNumber, data.amount, data.dueDate ? new Date(data.dueDate) : null, data.paidDate ? new Date(data.paidDate) : null, data.paidAmount || null, data.status || 'PENDING', data.notes || null, data.createdBy]
    );
    return res.rows[0];
  }

  public async update(id: string, data: any, userId?: string) {
    // Converter datas antes de passar ao helper (preserva comportamento original)
    const prepared = { ...data };
    if (prepared.dueDate !== undefined) prepared.dueDate = prepared.dueDate ? new Date(prepared.dueDate) : null;
    if (prepared.paidDate !== undefined) prepared.paidDate = prepared.paidDate ? new Date(prepared.paidDate) : null;

    const row = await buildUpdateQuery('installments', id, prepared, {
      transactionId: 'transaction_id',
      installmentNumber: 'installment_number',
      amount: 'amount',
      dueDate: 'due_date',
      paidDate: 'paid_date',
      paidAmount: 'paid_amount',
      status: 'status',
      notes: 'notes',
    }, userId);
    return row;
  }

  public async delete(id: string, userId?: string) {
    const query = 'DELETE FROM installments WHERE id = $1 AND ($2::uuid IS NULL OR created_by = $2) RETURNING *';
    const params: any[] = [id, userId ?? null];
    const res = await pool.query(query, params);
    return res.rows[0];
  }
}
