import { pool } from '../../shared/config/db';
import { LittersRepository } from './repository';
import { AppError } from '../../shared/utils/AppError';
export class LittersService {
  // Finite State Machine - Transições de status permitidas para ninhadas
  private static readonly ALLOWED_TRANSITIONS: Record<string, string[]> = {
    PLANNED: ['CONFIRMED', 'CANCELED'],
    CONFIRMED: ['BORN', 'CANCELED'],
    BORN: ['WEANING', 'CANCELED'],
    WEANING: ['COMPLETED', 'CANCELED'],
    COMPLETED: ['CANCELED'],
    CANCELED: [],
  };

  private repository: LittersRepository;
  constructor() { this.repository = new LittersRepository(); }
  public async getAll(skip: number, take: number, userId?: string) {
    const data = await this.repository.findAll(skip, take, userId);
    const total = await this.repository.count(userId);
    return { data, total };
  }
  public async getById(id: string, userId?: string) {
    const data = await this.repository.findById(id, userId);
    if (!data) throw new AppError('Registro não encontrado', 404, true, 'NOT_FOUND');
    return data;
  }
  public async create(data: any) {
    // Verify animals exist and belong to user
    if (data.createdBy) {
      const res = await pool.query('SELECT id FROM animals WHERE id IN ($1, $2) AND created_by = $3', [data.motherId, data.fatherId, data.createdBy]);
      if (res.rows.length !== 2) throw new AppError('Animais não encontrados ou não pertencem ao usuário.', 404);
    }

    // Validate sexes: mother must be FEMALE, father must be MALE
    const motherSexRes = await pool.query('SELECT sex FROM animals WHERE id = $1', [data.motherId]);
    if (!motherSexRes.rows.length) throw new AppError('Mãe não encontrada.', 404);
    if (motherSexRes.rows[0].sex !== 'FEMALE') {
      throw new AppError('O campo mãe deve ser um animal fêmea.', 400);
    }

    const fatherSexRes = await pool.query('SELECT sex FROM animals WHERE id = $1', [data.fatherId]);
    if (!fatherSexRes.rows.length) throw new AppError('Pai não encontrado.', 404);
    if (fatherSexRes.rows[0].sex !== 'MALE') {
      throw new AppError('O campo pai deve ser um animal macho.', 400);
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const res = await client.query(
        'INSERT INTO litters (mother_id, father_id, mating_date, birth_date, expected_date, birth_type, total_puppies, male_count, female_count, status, notes, created_by, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP) RETURNING *',
        [data.motherId, data.fatherId, data.matingDate ? new Date(data.matingDate) : null, data.birthDate ? new Date(data.birthDate) : null, data.expectedDate ? new Date(data.expectedDate) : null, data.birthType || null, data.totalPuppies || null, data.maleCount || null, data.femaleCount || null, data.status || 'PLANNED', data.notes, data.createdBy]
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
  public async update(id: string, data: any, userId?: string) {
    const current = await this.getById(id, userId); // ensure exists
    if (data.status && data.status !== current.status) {
      const allowed = LittersService.ALLOWED_TRANSITIONS[current.status] || [];
      if (!allowed.includes(data.status)) {
        throw new AppError(
          `Transição de status inválida: ${current.status} → ${data.status}`,
          400, true, 'INVALID_TRANSITION'
        );
      }
    }
    // Block birthDate change if puppies exist
    if (data.birthDate !== undefined && data.birthDate !== current.birth_date) {
      const puppyResult = await pool.query('SELECT COUNT(*) FROM puppies WHERE litter_id = $1', [id]);
      const puppyCount = parseInt(puppyResult.rows[0].count, 10);
      if (puppyCount > 0) {
        throw new AppError('Não é possível alterar data de nascimento após o nascimento dos filhotes.', 400, true, 'PUPPIES_EXIST');
      }
    }
    return this.repository.update(id, data, userId);
  }
  public async delete(id: string, userId?: string) {
    await this.getById(id, userId); // ensure exists
    const countResult = await pool.query('SELECT COUNT(*) FROM puppies WHERE litter_id = $1', [id]);
    const puppyCount = parseInt(countResult.rows[0].count, 10);
    if (puppyCount > 0) {
      console.warn(`[CASCADE] Deleting litter ${id} will also delete ${puppyCount} puppies`);
    }
    const deleted = await this.repository.delete(id, userId);
    return { ...deleted, deletedPuppiesCount: puppyCount };
  }
}
