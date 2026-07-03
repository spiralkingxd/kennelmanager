import { pool } from '../../shared/config/db';
import { buildUpdateQuery } from '../../shared/utils/updateHelper';

export class FinancialRepository {
  public async findAll(skip: number, take: number, filters?: { clientId?: string; animalId?: string; litterId?: string }, userId?: string) {
    let query = `
      SELECT t.*,
        c.name AS client_name, c.phone AS client_phone,
        COALESCE(p.name, p.color, 'Filhote') AS puppy_name,
        a.name AS animal_name
      FROM financial_transactions t
      LEFT JOIN clients c ON c.id = t.client_id
      LEFT JOIN puppies p ON p.id = t.puppy_id
      LEFT JOIN animals a ON a.id = t.animal_id
    `;
    const params: any[] = [];
    const conditions: string[] = [];
    let paramIndex = 1;

    if (filters?.clientId) {
      conditions.push(`t.client_id = $${paramIndex++}`);
      params.push(filters.clientId);
    }
    if (filters?.animalId) {
      conditions.push(`t.animal_id = $${paramIndex++}`);
      params.push(filters.animalId);
    }
    if (filters?.litterId) {
      conditions.push(`t.litter_id = $${paramIndex++}`);
      params.push(filters.litterId);
    }

    conditions.push(`($${paramIndex}::uuid IS NULL OR t.created_by = $${paramIndex})`);
    params.push(userId ?? null);
    paramIndex++;

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY t.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(take, skip);

    const res = await pool.query(query, params);
    return res.rows;
  }

  public async count(filters?: { clientId?: string; animalId?: string; litterId?: string }, userId?: string) {
    let query = 'SELECT COUNT(*) FROM financial_transactions t';
    const params: any[] = [];
    const conditions: string[] = [];
    let paramIndex = 1;

    if (filters?.clientId) {
      conditions.push(`t.client_id = $${paramIndex++}`);
      params.push(filters.clientId);
    }
    if (filters?.animalId) {
      conditions.push(`t.animal_id = $${paramIndex++}`);
      params.push(filters.animalId);
    }
    if (filters?.litterId) {
      conditions.push(`t.litter_id = $${paramIndex++}`);
      params.push(filters.litterId);
    }

    conditions.push(`($${paramIndex}::uuid IS NULL OR t.created_by = $${paramIndex})`);
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
      SELECT t.*,
        c.name AS client_name, c.phone AS client_phone,
        COALESCE(p.name, p.color, 'Filhote') AS puppy_name,
        a.name AS animal_name
      FROM financial_transactions t
      LEFT JOIN clients c ON c.id = t.client_id
      LEFT JOIN puppies p ON p.id = t.puppy_id
      LEFT JOIN animals a ON a.id = t.animal_id
      WHERE t.id = $1 AND ($2::uuid IS NULL OR t.created_by = $2)
    `;
    const params: any[] = [id, userId ?? null];
    const res = await pool.query(query, params);
    return res.rows[0] || null;
  }

  public async findByDescription(description: string, userId?: string) {
    const res = await pool.query(
      'SELECT id, type, category, amount, date, description, status, payment_method, due_date, paid_date, receipt_url, animal_id, client_id, puppy_id, litter_id, created_by, created_at, updated_at FROM financial_transactions WHERE description = $1 AND ($2::uuid IS NULL OR created_by = $2) LIMIT 1',
      [description, userId ?? null]
    );
    return res.rows[0] || null;
  }

  public async create(data: any) {
    const res = await pool.query(
      `INSERT INTO financial_transactions (type, category, amount, date, description, due_date, paid_date, receipt_url, status, payment_method, client_id, puppy_id, animal_id, litter_id, created_by, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, CURRENT_TIMESTAMP) RETURNING id, type, category, amount, date, description, status, payment_method, due_date, paid_date, receipt_url, animal_id, client_id, puppy_id, litter_id, created_by, created_at, updated_at`,
      [data.type, data.category || 'OTHER', data.amount, data.date ? new Date(data.date) : null, data.description || null, data.dueDate ? new Date(data.dueDate) : null, data.paidDate ? new Date(data.paidDate) : null, data.receiptUrl || null, data.status || 'PENDING', data.paymentMethod || null, data.clientId || null, data.puppyId || null, data.animalId || null, data.litterId || null, data.createdBy]
    );
    return res.rows[0];
  }

  public async update(id: string, data: any, userId?: string) {
    // Converter datas antes de passar ao helper (preserva comportamento original)
    const prepared = { ...data };
    if (prepared.date !== undefined) prepared.date = prepared.date ? new Date(prepared.date) : null;
    if (prepared.dueDate !== undefined) prepared.dueDate = prepared.dueDate ? new Date(prepared.dueDate) : null;
    if (prepared.paidDate !== undefined) prepared.paidDate = prepared.paidDate ? new Date(prepared.paidDate) : null;

    const row = await buildUpdateQuery('financial_transactions', id, prepared, {
      type: 'type',
      category: 'category',
      amount: 'amount',
      date: 'date',
      description: 'description',
      status: 'status',
      paymentMethod: 'payment_method',
      dueDate: 'due_date',
      paidDate: 'paid_date',
      receiptUrl: 'receipt_url',
      clientId: 'client_id',
      puppyId: 'puppy_id',
      animalId: 'animal_id',
      litterId: 'litter_id',
    }, userId);
    return row;
  }

  public async delete(id: string, userId?: string) {
    const query = 'DELETE FROM financial_transactions WHERE id = $1 AND ($2::uuid IS NULL OR created_by = $2) RETURNING id, type, category, amount, date, description, status, payment_method, due_date, paid_date, receipt_url, animal_id, client_id, puppy_id, litter_id, created_by, created_at, updated_at';
    const params: any[] = [id, userId ?? null];
    const res = await pool.query(query, params);
    return res.rows[0];
  }
}
