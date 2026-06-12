import { pool } from '../../shared/config/db';

export class AnimalsRepository {
  /** Converte string para Date, retornando null se inválido (defesa contra NaN) */
  private safeDate(val: any): Date | null {
    if (!val) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }

  public async findAll(skip: number, take: number, search?: string, userId?: string) {
    let query = 'SELECT id, name, breed, sex, size, color, weight, birth_date, death_date, microchip, registration_number, pedigree_number, status, is_available_for_breeding, temperament, origin, breeder, purchase_date, purchase_price, photo_url, notes, father_id, mother_id, owner_id, created_by, created_at, updated_at FROM animals';
    const params: any[] = [];
    let paramIndex = 1;
    const conditions: string[] = [];

    if (search && search.trim()) {
      conditions.push(`(name ILIKE $${paramIndex} OR breed ILIKE $${paramIndex} OR microchip ILIKE $${paramIndex} OR registration_number ILIKE $${paramIndex})`);
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    conditions.push(`($${paramIndex}::uuid IS NULL OR created_by = $${paramIndex})`);
    params.push(userId ?? null);
    paramIndex++;

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(take, skip);

    const res = await pool.query(query, params);
    return res.rows;
  }

  public async count(search?: string, userId?: string) {
    let query = 'SELECT COUNT(*) FROM animals';
    const params: any[] = [];
    let paramIndex = 1;
    const conditions: string[] = [];

    if (search && search.trim()) {
      conditions.push(`(name ILIKE $${paramIndex} OR breed ILIKE $${paramIndex} OR microchip ILIKE $${paramIndex} OR registration_number ILIKE $${paramIndex})`);
      params.push(`%${search.trim()}%`);
      paramIndex++;
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
    let query = `SELECT a.id, a.name, a.breed, a.sex, a.size, a.color, a.weight, a.birth_date, a.death_date, a.microchip, a.registration_number, a.pedigree_number, a.status, a.is_available_for_breeding, a.temperament, a.origin, a.breeder, a.purchase_date, a.purchase_price, a.photo_url, a.notes, a.father_id, a.mother_id, a.owner_id, a.created_by, a.created_at, a.updated_at,
        f.name AS father_name,
        m.name AS mother_name,
        c.name AS owner_name
       FROM animals a
       LEFT JOIN animals f ON f.id = a.father_id
       LEFT JOIN animals m ON m.id = a.mother_id
       LEFT JOIN clients c ON c.id = a.owner_id
       WHERE a.id = $1`;
    const params: any[] = [id, userId ?? null];
    query += ' AND ($2::uuid IS NULL OR a.created_by = $2)';

    const res = await pool.query(query, params);
    return res.rows[0] || null;
  }

  public async create(data: any) {
    const res = await pool.query(
      `INSERT INTO animals
        (name, breed, sex, size, color, weight, birth_date, death_date,
         microchip, registration_number, pedigree_number, status, is_available_for_breeding, temperament,
         origin, breeder, purchase_date, purchase_price, photo_url, notes,
         father_id, mother_id, owner_id, created_by, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
               $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        data.name, data.breed, data.sex,
        data.size || 'MEDIUM',
        data.color || null,
        data.weight || null,
        this.safeDate(data.birthDate),
        this.safeDate(data.deathDate),
        data.microchip || null,
        data.registrationNumber || null,
        data.pedigreeNumber || null,
        data.status || 'ACTIVE',
        data.isAvailableForBreeding !== false,
        data.temperament || [],
        data.origin || null,
        data.breeder || null,
        this.safeDate(data.purchaseDate),
        data.purchasePrice || null,
        data.photoUrl || null,
        data.notes || null,
        data.fatherId || null,
        data.motherId || null,
        data.ownerId || null,
        data.createdBy || null,
      ]
    );
    return res.rows[0];
  }

  public async update(id: string, data: any, userId?: string) {
    const fieldMap: Record<string, string> = {
      name: 'name',
      breed: 'breed',
      sex: 'sex',
      size: 'size',
      color: 'color',
      weight: 'weight',
      birthDate: 'birth_date',
      deathDate: 'death_date',
      microchip: 'microchip',
      registrationNumber: 'registration_number',
      pedigreeNumber: 'pedigree_number',
      status: 'status',
      isAvailableForBreeding: 'is_available_for_breeding',
      temperament: 'temperament',
      origin: 'origin',
      breeder: 'breeder',
      purchaseDate: 'purchase_date',
      purchasePrice: 'purchase_price',
      photoUrl: 'photo_url',
      notes: 'notes',
      fatherId: 'father_id',
      motherId: 'mother_id',
      ownerId: 'owner_id',
    };

    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) {
        fields.push(`${col} = $${paramIndex}`);
        values.push(
          key === 'birthDate' || key === 'deathDate' || key === 'purchaseDate'
            ? this.safeDate(data[key])
            : data[key]
        );
        paramIndex++;
      }
    }

    if (fields.length === 0) return this.findById(id, userId);

    // Add created_by = COALESCE to preserve existing value if userId is null
    fields.push(`created_by = COALESCE($${paramIndex}, created_by)`);
    values.push(userId || null);
    paramIndex++;

    fields.push('updated_at = CURRENT_TIMESTAMP');

    // WHERE clause with id and user isolation
    const idParamIndex = paramIndex;
    values.push(id);
    paramIndex++;

    const userIdParamIndex = paramIndex;
    values.push(userId || null);

    const res = await pool.query(
      `UPDATE animals SET ${fields.join(', ')} WHERE id = $${idParamIndex} AND ($${userIdParamIndex}::uuid IS NULL OR created_by = $${userIdParamIndex}) RETURNING *`,
      values
    );
    return res.rows[0];
  }

  public async getImpactDetails(id: string) {
    const countQuery = `
      SELECT
        (SELECT COUNT(*) FROM litters WHERE mother_id = $1 OR father_id = $1) AS litters,
        (SELECT COUNT(*) FROM matings WHERE female_id = $1 OR male_id = $1) AS matings,
        (SELECT COUNT(*) FROM gestations WHERE animal_id = $1) AS gestations,
        (SELECT COUNT(*) FROM heat_cycles WHERE animal_id = $1) AS heat_cycles,
        (SELECT COUNT(*) FROM vaccines WHERE animal_id = $1) AS vaccines,
        (SELECT COUNT(*) FROM deworming WHERE animal_id = $1) AS deworming,
        (SELECT COUNT(*) FROM exams WHERE animal_id = $1) AS exams,
        (SELECT COUNT(*) FROM consultations WHERE animal_id = $1) AS consultations,
        (SELECT COUNT(*) FROM weight_history WHERE animal_id = $1) AS weight_history,
        (SELECT COUNT(*) FROM medications WHERE animal_id = $1) AS medications,
        (SELECT COUNT(*) FROM documents WHERE animal_id = $1) AS documents,
        (SELECT COUNT(*) FROM financial_transactions WHERE animal_id = $1) AS financial_transactions,
        (SELECT COUNT(*) FROM calendar_events WHERE animal_id = $1) AS calendar_events,
        (SELECT EXISTS(SELECT 1 FROM gestations WHERE animal_id = $1 AND is_active = true)) AS has_active_gestations
    `;
    const countRes = await pool.query(countQuery, [id]);
    const c = countRes.rows[0];
    const counts = {
      litters: parseInt(c.litters, 10),
      matings: parseInt(c.matings, 10),
      gestations: parseInt(c.gestations, 10),
      heat_cycles: parseInt(c.heat_cycles, 10),
      vaccines: parseInt(c.vaccines, 10),
      deworming: parseInt(c.deworming, 10),
      exams: parseInt(c.exams, 10),
      consultations: parseInt(c.consultations, 10),
      weight_history: parseInt(c.weight_history, 10),
      medications: parseInt(c.medications, 10),
      documents: parseInt(c.documents, 10),
      financial_transactions: parseInt(c.financial_transactions, 10),
      calendar_events: parseInt(c.calendar_events, 10),
    };

    const [litters, matings, gestations, heatCycles, vaccines, deworming, exams, consultations, weightHistory, medications, documents, financialTransactions, calendarEvents] = await Promise.all([
      pool.query('SELECT id, mother_id, father_id, birth_date, status, notes FROM litters WHERE mother_id = $1 OR father_id = $1 ORDER BY created_at DESC LIMIT 5', [id]),
      pool.query('SELECT id, female_id, male_id, type, date FROM matings WHERE female_id = $1 OR male_id = $1 ORDER BY date DESC LIMIT 5', [id]),
      pool.query('SELECT id, animal_id, start_date, is_active FROM gestations WHERE animal_id = $1 ORDER BY start_date DESC LIMIT 5', [id]),
      pool.query('SELECT id, start_date, end_date, intensity, was_mated FROM heat_cycles WHERE animal_id = $1 ORDER BY start_date DESC LIMIT 5', [id]),
      pool.query('SELECT id, name, date, next_due_date FROM vaccines WHERE animal_id = $1 ORDER BY date DESC LIMIT 5', [id]),
      pool.query('SELECT id, product, date, next_due_date FROM deworming WHERE animal_id = $1 ORDER BY date DESC LIMIT 5', [id]),
      pool.query('SELECT id, type, date, result FROM exams WHERE animal_id = $1 ORDER BY date DESC LIMIT 5', [id]),
      pool.query('SELECT id, date, reason, diagnosis FROM consultations WHERE animal_id = $1 ORDER BY date DESC LIMIT 5', [id]),
      pool.query('SELECT id, weight, date FROM weight_history WHERE animal_id = $1 ORDER BY date DESC LIMIT 5', [id]),
      pool.query('SELECT id, name, start_date, status FROM medications WHERE animal_id = $1 ORDER BY start_date DESC LIMIT 5', [id]),
      pool.query('SELECT id, type, name, created_at FROM documents WHERE animal_id = $1 ORDER BY created_at DESC LIMIT 5', [id]),
      pool.query('SELECT id, type, amount, status, date FROM financial_transactions WHERE animal_id = $1 ORDER BY date DESC LIMIT 5', [id]),
      pool.query('SELECT id, title, date, category FROM calendar_events WHERE animal_id = $1 ORDER BY date DESC LIMIT 5', [id]),
    ]);

    return {
      counts,
      hasActiveGestations: c.has_active_gestations,
      details: {
        litters: litters.rows,
        matings: matings.rows,
        gestations: gestations.rows,
        heat_cycles: heatCycles.rows,
        vaccines: vaccines.rows,
        deworming: deworming.rows,
        exams: exams.rows,
        consultations: consultations.rows,
        weight_history: weightHistory.rows,
        medications: medications.rows,
        documents: documents.rows,
        financial_transactions: financialTransactions.rows,
        calendar_events: calendarEvents.rows,
      },
    };
  }

  public async deleteWithCleanup(id: string, userId?: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query('UPDATE litters SET mother_id = NULL WHERE mother_id = $1', [id]);
      await client.query('UPDATE litters SET father_id = NULL WHERE father_id = $1', [id]);
      await client.query('UPDATE matings SET female_id = NULL WHERE female_id = $1', [id]);
      await client.query('UPDATE matings SET male_id = NULL WHERE male_id = $1', [id]);
      await client.query('UPDATE gestations SET animal_id = NULL WHERE animal_id = $1', [id]);
      await client.query('DELETE FROM financial_transactions WHERE animal_id = $1', [id]);

      const res = await client.query(
        'DELETE FROM animals WHERE id = $1 AND ($2::uuid IS NULL OR created_by = $2) RETURNING *',
        [id, userId ?? null]
      );

      await client.query('COMMIT');
      return res.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
