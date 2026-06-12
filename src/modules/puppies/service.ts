import { pool } from '../../shared/config/db';
import { PuppiesRepository } from './repository';
import { SalesService } from '../sales/service';
import { AppError } from '../../shared/utils/AppError';
import { logger } from '../../config/winston';

export class PuppiesService {
  private repository: PuppiesRepository;
  private salesService: SalesService;
  constructor() { this.repository = new PuppiesRepository(); this.salesService = new SalesService(); }

  public async getAll(skip: number, take: number, litterId?: string, userId?: string) {
    if (litterId) {
      const data = await this.repository.findAll(skip, take, litterId, userId);
      return { data, total: data.length };
    }
    const data = await this.repository.findAll(skip, take, undefined, userId);
    const total = await this.repository.count(userId);
    return { data, total };
  }

  public async getById(id: string, userId?: string) {
    const data = await this.repository.findById(id, userId);
    if (!data) throw new AppError('Registro não encontrado', 404, true, 'NOT_FOUND');
    return data;
  }

  public async create(data: any) {
    if (data.createdBy) {
      const res = await pool.query(`
        SELECT l.id FROM litters l
        JOIN animals a ON a.id = l.mother_id
        WHERE l.id = $1 AND a.created_by = $2
      `, [data.litterId, data.createdBy]);
      if (!res.rows.length) throw new AppError('Ninhada não encontrada ou não pertence ao usuário.', 404);
    }

    // Prevent adding puppies to a completed litter
    const litterRes = await pool.query('SELECT status FROM litters WHERE id = $1', [data.litterId]);
    if (litterRes.rows.length && litterRes.rows[0].status === 'COMPLETED') {
      throw new AppError('Não é possível adicionar filhotes a uma ninhada concluída.', 400);
    }

    return this.repository.create(data);
  }

  public async update(id: string, data: any, userId?: string) {
    const current = await this.getById(id, userId); // ensure exists + capture old state

    // H-5: Prevent selling a dead puppy
    if (current.status === 'DEAD' && data.status === 'SOLD') {
      throw new AppError('Não é possível vender um filhote morto.', 400, true);
    }

    // H-6: State machine validation for puppy status transitions
    const ALLOWED_TRANSITIONS: Record<string, string[]> = {
      AVAILABLE: ['RESERVED', 'SOLD', 'RETAINED', 'DEAD'],
      RESERVED: ['AVAILABLE', 'SOLD', 'DEAD'],
      SOLD: ['DEAD'],
      RETAINED: ['DEAD'],
      DEAD: [],     // Dead is terminal
    };

    if (data.status && data.status !== current.status) {
      const allowed = ALLOWED_TRANSITIONS[current.status] || [];
      if (!allowed.includes(data.status)) {
        throw new AppError(
          `Transição de status inválida: ${current.status} → ${data.status}`,
          400, true
        );
      }
    }

    // Block transition to SOLD without a client
    if (data.status === 'SOLD' && !data.clientId && !current.client_id) {
      throw new AppError('Cliente é obrigatório para vender um filhote.', 400, true);
    }

    const updated = await this.repository.update(id, data, userId);

    // Detect transition to SOLD and auto-create/complete sales record
    if (current.status !== 'SOLD' && data.status === 'SOLD') {
      try {
        // Primeiro tenta completar uma sale PENDING existente (ex: reserva)
        const completed = await this.salesService.completeExistingPending(id, userId);
        if (!completed) {
          // Se não existia PENDING, cria nova COMPLETED
          await this.salesService.create({
            clientId: data.clientId,
            puppyId: id,
            status: 'COMPLETED',
            condition: 'CASH',
            totalValue: data.price ?? current.price,
            notes: 'Venda automática via filhote',
            createdBy: userId,
          });
        }
      } catch (error) {
        logger.error('Erro ao criar registro de venda:', { error, puppyId: id });
      }
    }

    return updated;
  }

  public async delete(id: string, userId?: string) {
    await this.getById(id, userId); // ensure exists
    return this.repository.delete(id, userId);
  }
}
