import { FinancialRepository } from './repository';
import { AppError } from '../../shared/utils/AppError';
import { pool } from '../../shared/config/db';
export class FinancialService {
  private repository: FinancialRepository;
  constructor() { this.repository = new FinancialRepository(); }
  public async getAll(skip: number, take: number, filters?: { clientId?: string; animalId?: string; litterId?: string }, userId?: string) {
    const data = await this.repository.findAll(skip, take, filters, userId);
    const total = await this.repository.count(filters, userId);
    return { data, total };
  }
  public async getById(id: string, userId?: string) {
    const data = await this.repository.findById(id, userId);
    if (!data) throw new AppError('Registro não encontrado', 404, true, 'NOT_FOUND');
    return data;
  }
  public async create(data: any) {
    // Validate foreign keys exist
    if (data.clientId) {
      const client = await pool.query('SELECT id FROM clients WHERE id = $1', [data.clientId]);
      if (client.rows.length === 0) throw new AppError('Cliente não encontrado', 400, true);
    }
    if (data.puppyId) {
      const puppy = await pool.query('SELECT id FROM puppies WHERE id = $1', [data.puppyId]);
      if (puppy.rows.length === 0) throw new AppError('Filhote não encontrado', 400, true);
    }
    if (data.animalId) {
      const animal = await pool.query('SELECT id FROM animals WHERE id = $1', [data.animalId]);
      if (animal.rows.length === 0) throw new AppError('Animal não encontrado', 400, true);
    }
    // Validate amount is positive
    if (!data.amount || typeof data.amount !== 'number' || data.amount <= 0) {
      throw new AppError('Valor da transação deve ser maior que zero.', 400, true, 'INVALID_AMOUNT');
    }
    return this.repository.create(data);
  }
  public async update(id: string, data: any, userId?: string) {
    const current = await this.getById(id, userId);

    // Status FSM validation
    if (data.status && data.status !== current.status) {
      // Only allow PENDING → PAID
      if (!(current.status === 'PENDING' && data.status === 'PAID')) {
        throw new AppError(
          `Transição de status inválida: ${current.status} → ${data.status}. Apenas PENDING → PAID é permitido.`,
          400, true, 'INVALID_TRANSITION'
        );
      }
    }

    // Amount validation on update
    if (data.amount !== undefined && (typeof data.amount !== 'number' || data.amount <= 0)) {
      throw new AppError('Valor da transação deve ser maior que zero.', 400, true, 'INVALID_AMOUNT');
    }

    return this.repository.update(id, data, userId);
  }
  public async delete(id: string, userId?: string) {
    await this.getById(id, userId);
    return this.repository.delete(id, userId);
  }
}
