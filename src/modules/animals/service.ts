import { pool } from '../../shared/config/db';
import { AnimalsRepository } from './repository';
import { AppError } from '../../shared/utils/AppError';
export class AnimalsService {
  private repository: AnimalsRepository;
  constructor() { this.repository = new AnimalsRepository(); }
  public async getAll(skip: number, take: number, search?: string, userId?: string) {
    const data = await this.repository.findAll(skip, take, search, userId);
    const total = await this.repository.count(search, userId);
    return { data, total };
  }
  public async getById(id: string, userId?: string) {
    const data = await this.repository.findById(id, userId);
    if (!data) throw new AppError('Registro não encontrado', 404, true, 'NOT_FOUND');
    return data;
  }
  public async create(data: any) { return this.repository.create(data); }
  public async update(id: string, data: any, userId?: string) {
    const current = await this.getById(id, userId); // ensure exists and belongs to user
    // Block sex change if animal has reproductive events
    if (data.sex !== undefined && data.sex !== current.sex) {
      const reproductiveResult = await pool.query(`
        SELECT
          (SELECT COUNT(*) FROM matings WHERE animal_id = $1) +
          (SELECT COUNT(*) FROM gestations WHERE animal_id = $1) +
          (SELECT COUNT(*) FROM heat_cycles WHERE animal_id = $1)
        AS total
      `, [id]);
      const reproductiveCount = parseInt(reproductiveResult.rows[0].total, 10);
      if (reproductiveCount > 0) {
        throw new AppError('Não é possível alterar sexo de animal com eventos reprodutivos registrados.', 400, true, 'REPRODUCTIVE_EVENTS_EXIST');
      }
    }
    return this.repository.update(id, data, userId);
  }
  public async getImpact(id: string, userId?: string) {
    await this.getById(id, userId); // ensure exists and belongs to user
    return this.repository.getImpactDetails(id);
  }

  public async delete(id: string, userId?: string) {
    await this.getById(id, userId); // ensure exists and belongs to user
    const countResult = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM vaccines WHERE animal_id = $1) +
        (SELECT COUNT(*) FROM deworming WHERE animal_id = $1) +
        (SELECT COUNT(*) FROM exams WHERE animal_id = $1) +
        (SELECT COUNT(*) FROM consultations WHERE animal_id = $1) +
        (SELECT COUNT(*) FROM medications WHERE animal_id = $1) +
        (SELECT COUNT(*) FROM weight_history WHERE animal_id = $1) +
        (SELECT COUNT(*) FROM heat_cycles WHERE animal_id = $1) +
        (SELECT COUNT(*) FROM matings WHERE animal_id = $1) +
        (SELECT COUNT(*) FROM gestations WHERE animal_id = $1) +
        (SELECT COUNT(*) FROM financial_transactions WHERE animal_id = $1)
      AS total
    `, [id]);
    const totalHealthRecords = parseInt(countResult.rows[0].total, 10);
    if (totalHealthRecords > 0) {
      console.warn(`[CASCADE] Deleting animal ${id} will also delete ${totalHealthRecords} health/financial record(s)`);
    }
    // Clean up blocking references + delete in a single transaction
    const deleted = await this.repository.deleteWithCleanup(id, userId);
    return { ...deleted, deletedHealthRecordsCount: totalHealthRecords };
  }
}
