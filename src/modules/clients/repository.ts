import { pool } from '../../shared/config/db';
import { buildUpdateQuery } from '../../shared/utils/updateHelper';

export class ClientsRepository {
  public async findAll(skip: number, take: number, userId?: string) {
    const res = await pool.query(
      'SELECT id, name, email, phone, secondary_phone, address, city, state, zip_code, birth_date, profession, notes, how_found_us, created_by, created_at, updated_at FROM clients WHERE ($1::uuid IS NULL OR created_by = $1) ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [userId ?? null, take, skip]
    );
    return res.rows;
  }
  public async count(userId?: string) {
    const res = await pool.query(
      'SELECT COUNT(*) FROM clients WHERE ($1::uuid IS NULL OR created_by = $1)',
      [userId ?? null]
    );
    return parseInt(res.rows[0].count);
  }
  public async findById(id: string, userId?: string) {
    const res = await pool.query(
      'SELECT id, name, email, phone, secondary_phone, address, city, state, zip_code, birth_date, profession, notes, how_found_us, created_by, created_at, updated_at FROM clients WHERE id = $1 AND ($2::uuid IS NULL OR created_by = $2)',
      [id, userId ?? null]
    );
    return res.rows[0] || null;
  }
  public async search(query: string, userId?: string, limit: number = 20) {
    const q = `%${query}%`;
    const res = await pool.query(
      'SELECT id, name, email, phone, secondary_phone, address, city, state, zip_code, birth_date, profession, notes, how_found_us, created_by, created_at, updated_at FROM clients WHERE (name ILIKE $1 OR phone ILIKE $1 OR email ILIKE $1) AND ($2::uuid IS NULL OR created_by = $2) ORDER BY name ASC LIMIT $3',
      [q, userId ?? null, limit]
    );
    return res.rows;
  }

  public async getImpactDetails(id: string, userId?: string): Promise<{
    counts: {
      sales: number;
      client_interactions: number;
      documents: number;
      waitlist: number;
      puppies: number;
      financial_transactions: number;
      animals: number;
      calendar_events: number;
    };
    details: {
      sales: Array<{ id: string; status: string; value: string; created_at: string }>;
      client_interactions: Array<{ id: string; type: string; description: string; created_at: string }>;
      documents: Array<{ id: string; type: string; name: string; created_at: string }>;
      waitlist: Array<{ id: string; preferred_breed: string; max_price: string; created_at: string }>;
      puppies: Array<{ id: string; name: string; sex: string; status: string; color: string; created_at: string }>;
      financial_transactions: Array<{ id: string; type: string; amount: string; status: string; created_at: string }>;
      animals: Array<{ id: string; name: string; breed: string; created_at: string }>;
      calendar_events: Array<{ id: string; title: string; date: string; category: string; created_at: string }>;
    };
    hasActiveNegotiations: boolean;
  }> {
    const safe = userId ?? null;
    const [counts, sf, ci, doc, wl, pup, ft, ani, ce] = await Promise.all([
      pool.query(
        `SELECT
          (SELECT COUNT(*) FROM sales WHERE client_id = $1 AND ($2::uuid IS NULL OR created_by = $2)) as sales,
          (SELECT COUNT(*) FROM client_interactions WHERE client_id = $1 AND ($3::uuid IS NULL OR user_id = $3)) as client_interactions,
          (SELECT COUNT(*) FROM documents WHERE client_id = $1 AND ($4::uuid IS NULL OR uploaded_by = $4)) as documents,
          (SELECT COUNT(*) FROM waitlist WHERE client_id = $1 AND ($5::uuid IS NULL OR created_by = $5)) as waitlist,
          (SELECT COUNT(*) FROM puppies WHERE client_id = $1 AND ($6::uuid IS NULL OR created_by = $6)) as puppies,
          (SELECT COUNT(*) FROM financial_transactions WHERE client_id = $1 AND ($7::uuid IS NULL OR created_by = $7)) as financial_transactions,
          (SELECT COUNT(*) FROM animals WHERE owner_id = $1 AND ($8::uuid IS NULL OR created_by = $8)) as animals,
          (SELECT COUNT(*) FROM calendar_events WHERE client_id = $1 AND ($9::uuid IS NULL OR created_by = $9)) as calendar_events,
          EXISTS(SELECT 1 FROM sales WHERE client_id = $1 AND status = 'PENDING' AND ($10::uuid IS NULL OR created_by = $10) LIMIT 1) as has_active_negotiations`,
        [id, safe, safe, safe, safe, safe, safe, safe, safe, safe]
      ),
      pool.query('SELECT id, status, total_value as value, created_at FROM sales WHERE client_id = $1 AND ($2::uuid IS NULL OR created_by = $2) ORDER BY created_at DESC LIMIT 5', [id, safe]),
      pool.query('SELECT id, type, description, created_at FROM client_interactions WHERE client_id = $1 AND ($2::uuid IS NULL OR user_id = $2) ORDER BY created_at DESC LIMIT 5', [id, safe]),
      pool.query('SELECT id, type, name, created_at FROM documents WHERE client_id = $1 AND ($2::uuid IS NULL OR uploaded_by = $2) ORDER BY created_at DESC LIMIT 5', [id, safe]),
      pool.query('SELECT id, preferred_breed, max_price, created_at FROM waitlist WHERE client_id = $1 AND ($2::uuid IS NULL OR created_by = $2) ORDER BY created_at DESC LIMIT 5', [id, safe]),
      pool.query('SELECT id, name, sex, status, color, created_at FROM puppies WHERE client_id = $1 AND ($2::uuid IS NULL OR created_by = $2) ORDER BY created_at DESC LIMIT 5', [id, safe]),
      pool.query('SELECT id, type, amount, status, created_at FROM financial_transactions WHERE client_id = $1 AND ($2::uuid IS NULL OR created_by = $2) ORDER BY created_at DESC LIMIT 5', [id, safe]),
      pool.query('SELECT id, name, breed, created_at FROM animals WHERE owner_id = $1 AND ($2::uuid IS NULL OR created_by = $2) ORDER BY created_at DESC LIMIT 5', [id, safe]),
      pool.query('SELECT id, title, date, category, created_at FROM calendar_events WHERE client_id = $1 AND ($2::uuid IS NULL OR created_by = $2) ORDER BY created_at DESC LIMIT 5', [id, safe]),
    ]);
    const r = counts.rows[0];
    return {
      counts: {
        sales: parseInt(r.sales),
        client_interactions: parseInt(r.client_interactions),
        documents: parseInt(r.documents),
        waitlist: parseInt(r.waitlist),
        puppies: parseInt(r.puppies),
        financial_transactions: parseInt(r.financial_transactions),
        animals: parseInt(r.animals),
        calendar_events: parseInt(r.calendar_events),
      },
      details: {
        sales: sf.rows,
        client_interactions: ci.rows,
        documents: doc.rows,
        waitlist: wl.rows,
        puppies: pup.rows,
        financial_transactions: ft.rows,
        animals: ani.rows,
        calendar_events: ce.rows,
      },
      hasActiveNegotiations: r.has_active_negotiations,
    };
  }
  public async getBulkImpactDetails(ids: string[], userId?: string) {
    const safe = userId ?? null;
    const res = await pool.query(
      `SELECT
         c.id,
         c.name,
         (SELECT COUNT(*) FROM sales WHERE client_id = c.id AND status = 'PENDING' AND ($2::uuid IS NULL OR created_by = $2)) > 0 AS has_active_negotiations,
         (SELECT COUNT(*) FROM sales WHERE client_id = c.id AND ($2::uuid IS NULL OR created_by = $2)) AS sales,
         (SELECT COUNT(*) FROM client_interactions WHERE client_id = c.id AND ($2::uuid IS NULL OR user_id = $2)) AS client_interactions,
         (SELECT COUNT(*) FROM documents WHERE client_id = c.id AND ($2::uuid IS NULL OR uploaded_by = $2)) AS documents,
         (SELECT COUNT(*) FROM waitlist WHERE client_id = c.id AND ($2::uuid IS NULL OR created_by = $2)) AS waitlist,
         (SELECT COUNT(*) FROM puppies WHERE client_id = c.id AND ($2::uuid IS NULL OR created_by = $2)) AS puppies,
         (SELECT COUNT(*) FROM financial_transactions WHERE client_id = c.id AND ($2::uuid IS NULL OR created_by = $2)) AS financial_transactions,
         (SELECT COUNT(*) FROM animals WHERE owner_id = c.id AND ($2::uuid IS NULL OR created_by = $2)) AS animals,
         (SELECT COUNT(*) FROM calendar_events WHERE client_id = c.id AND ($2::uuid IS NULL OR created_by = $2)) AS calendar_events
       FROM clients c
       WHERE c.id = ANY($1::uuid[])
         AND ($2::uuid IS NULL OR c.created_by = $2)
       ORDER BY c.name ASC`,
      [ids, safe]
    );
    const rows = res.rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      hasActiveNegotiations: r.has_active_negotiations,
      impact: {
        sales: parseInt(r.sales),
        client_interactions: parseInt(r.client_interactions),
        documents: parseInt(r.documents),
        waitlist: parseInt(r.waitlist),
        puppies: parseInt(r.puppies),
        financial_transactions: parseInt(r.financial_transactions),
        animals: parseInt(r.animals),
        calendar_events: parseInt(r.calendar_events),
      },
    }));
    return {
      total: rows.length,
      hasActiveNegotiations: rows.some((r: any) => r.hasActiveNegotiations),
      clients: rows,
    };
  }
  public async create(data: any) {
    const res = await pool.query(
      `INSERT INTO clients (name, email, phone, secondary_phone, address, city, state, zip_code, birth_date, profession, notes, how_found_us, created_by, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP) RETURNING *`,
      [data.name, data.email, data.phone, data.secondaryPhone, data.address, data.city, data.state, data.zipCode, data.birthDate, data.profession, data.notes, data.howFoundUs, data.createdBy || null]
    );
    return res.rows[0];
  }
  public async update(id: string, data: any, userId?: string) {
    // created_by tem tratamento especial: COALESCE mantém o valor existente se não fornecido
    const prepared = { ...data };
    if (prepared.createdBy !== undefined) {
      // Incluir createdBy manualmente após o helper
    }

    const row = await buildUpdateQuery('clients', id, data, {
      name: 'name',
      email: 'email',
      phone: 'phone',
      secondaryPhone: 'secondary_phone',
      address: 'address',
      city: 'city',
      state: 'state',
      zipCode: 'zip_code',
      birthDate: 'birth_date',
      profession: 'profession',
      notes: 'notes',
      howFoundUs: 'how_found_us',
    }, userId);

    // Se createdBy foi fornecido, atualizar separadamente
    if (data.createdBy !== undefined) {
      await pool.query(
        'UPDATE clients SET created_by = $1 WHERE id = $2 AND ($3::uuid IS NULL OR created_by = $3)',
        [data.createdBy, id, userId ?? null]
      );
    }

    return row || (await pool.query('SELECT id, name, email, phone, secondary_phone, address, city, state, zip_code, birth_date, profession, notes, how_found_us, created_by, created_at, updated_at FROM clients WHERE id = $1', [id])).rows[0];
  }
  public async delete(id: string, userId?: string) {
    const res = await pool.query(
      'DELETE FROM clients WHERE id = $1 AND ($2::uuid IS NULL OR created_by = $2) RETURNING *',
      [id, userId ?? null]
    );
    return res.rows[0];
  }
  public async bulkDelete(ids: string[], userId?: string) {
    const res = await pool.query(
      `WITH deleted AS (
         DELETE FROM clients
         WHERE id = ANY($1::uuid[])
           AND ($2::uuid IS NULL OR created_by = $2)
           AND NOT EXISTS (
             SELECT 1 FROM sales
             WHERE client_id = clients.id
               AND status = 'PENDING'
               AND ($2::uuid IS NULL OR created_by = $2)
           )
         RETURNING id
       )
       SELECT COUNT(*) AS deleted_count FROM deleted`,
      [ids, userId ?? null]
    );
    return { deletedCount: parseInt(res.rows[0].deleted_count) };
  }
}
