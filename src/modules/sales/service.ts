import { pool } from '../../shared/config/db';
import { SalesRepository } from './repository';
import { FinancialRepository } from '../financial/repository';
import { PuppiesRepository } from '../puppies/repository';
import { AppError } from '../../shared/utils/AppError';
import { logger } from '../../config/winston';
import type { SaleLike } from './automations/types';

export class SalesService {
  // Finite State Machine - Transições de status permitidas
  // PENDING  → COMPLETED, CANCELLED
  // COMPLETED → CANCELLED
  // CANCELLED → PENDING
  private static readonly ALLOWED_TRANSITIONS: Record<string, string[]> = {
    PENDING: ['COMPLETED', 'CANCELLED'],
    COMPLETED: ['CANCELLED'],
    CANCELLED: ['PENDING'],
  };

  private repository: SalesRepository;
  private financialRepository: FinancialRepository;
  private puppiesRepository: PuppiesRepository;

  constructor() {
    this.repository = new SalesRepository();
    this.financialRepository = new FinancialRepository();
    this.puppiesRepository = new PuppiesRepository();
  }

  public async getAll(skip: number, take: number, userId?: string) {
    const data = await this.repository.findAll(skip, take, userId);
    const total = await this.repository.count(userId);
    return { data, total };
  }

  public async getById(id: string, userId?: string) {
    const data = await this.repository.findById(id, userId);
    if (!data) throw new AppError('Venda não encontrada', 404, true, 'NOT_FOUND');
    return data;
  }

  public async create(data: any) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      if (data.clientId) {
        const clientRes = await client.query('SELECT id FROM clients WHERE id = $1', [data.clientId]);
        if (!clientRes.rows.length) throw new AppError('Cliente não encontrado.', 404);
      }

      // Lock puppy row to prevent double-booking race condition
      if (data.puppyId) {
        const puppyRes = await client.query(
          `SELECT p.id, p.status FROM puppies p WHERE p.id = $1`,
          [data.puppyId]
        );
        if (!puppyRes.rows.length) throw new AppError('Filhote não encontrado.', 404);

        const puppy = puppyRes.rows[0];
        if (puppy.status !== 'AVAILABLE') {
          throw new AppError(`Filhote não está disponível. Status atual: ${puppy.status}`, 400);
        }

        // Lock the puppy row with FOR UPDATE to prevent concurrent sales
        await client.query(
          `SELECT id FROM puppies WHERE id = $1 FOR UPDATE`,
          [data.puppyId]
        );

        // Verify ownership if userId provided
        if (data.createdBy) {
          const ownerRes = await client.query(`
            SELECT p.id FROM puppies p
            JOIN litters l ON l.id = p.litter_id
            JOIN animals a ON a.id = l.mother_id
            WHERE p.id = $1 AND a.created_by = $2
          `, [data.puppyId, data.createdBy]);
          if (!ownerRes.rows.length) throw new AppError('Filhote não encontrado ou não pertence ao usuário.', 404);
        }
      }

      const result = await this.repository.createFromTransaction(client, data);

      await client.query('COMMIT');

      if (result.status === 'COMPLETED') {
        await Promise.all([
          this.tryCreateFinancialTransaction(result),
          this.tryUpdatePuppyOnCompletion(result),
        ]);
      } else if (result.status === 'PENDING') {
        await Promise.all([
          this.tryCreateReservationTransaction(result),
          this.tryUpdatePuppyOnReservation(result),
        ]);
      }
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  public async update(id: string, data: any, userId?: string) {
    const current = await this.getById(id, userId);
    if (data.status && data.status !== current.status) {
      const allowed = SalesService.ALLOWED_TRANSITIONS[current.status];
      if (!allowed || !allowed.includes(data.status)) {
        throw new AppError(`Transição de status inválida: ${current.status} → ${data.status}`, 400, true, 'INVALID_TRANSITION');
      }
    }
    const result = await this.repository.update(id, data, userId);
    if (result && result.status === 'COMPLETED') {
      await Promise.all([
        this.tryCreateFinancialTransaction(result),
        this.tryUpdatePuppyOnCompletion(result),
      ]);
    } else if (result && result.status === 'PENDING') {
      await Promise.all([
        this.tryCreateReservationTransaction(result),
        this.tryUpdatePuppyOnReservation(result),
      ]);
    } else if (result && result.status === 'CANCELLED') {
      await this.tryFreePuppyOnCancellation(result);
    }
    return result;
  }

  public async findPendingByPuppyId(puppyId: string, userId?: string) {
    return this.repository.findPendingByPuppyId(puppyId, userId);
  }

  public async completeExistingPending(puppyId: string, userId?: string) {
    const pending = await this.repository.findPendingByPuppyId(puppyId, userId);
    if (!pending) return null;
    return this.update(pending.id, { status: 'COMPLETED' }, userId);
  }

  public async delete(id: string, userId?: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get sale WITHIN transaction
      const saleRes = await client.query(
        'SELECT * FROM sales WHERE id = $1 AND ($2::uuid IS NULL OR created_by = $2)',
        [id, userId ?? null]
      );
      const sale = saleRes.rows[0];
      if (!sale) throw new AppError('Venda não encontrada', 404, true, 'NOT_FOUND');

      // Free puppy WITHIN transaction
      if (sale.puppy_id) {
        await client.query(
          `UPDATE puppies SET status = 'AVAILABLE', client_id = NULL, sale_date = NULL, updated_at = CURRENT_TIMESTAMP
           WHERE id = $1 AND (status = 'RESERVED' OR status = 'SOLD')`,
          [sale.puppy_id]
        );
      }

      // Delete sale WITHIN transaction
      await client.query(
        'DELETE FROM sales WHERE id = $1 AND ($2::uuid IS NULL OR created_by = $2)',
        [id, userId ?? null]
      );

      await client.query('COMMIT');

      // Outside transaction: cleanup financial (non-critical, best-effort)
      this.tryDeleteFinancialTransaction(`Venda #${id}`);
      this.tryDeleteFinancialTransaction(`Reserva #${id}`);

      return sale;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  private async tryDeleteFinancialTransaction(description: string) {
    try {
      const tx = await this.financialRepository.findByDescription(description, undefined);
      if (tx) {
        await this.financialRepository.delete(tx.id, undefined);
        logger.info(`Transação financeira "${description}" deletada junto com a venda.`);
      }
    } catch (err) {
      logger.error(`Erro ao deletar transação financeira "${description}":`, { error: err });
    }
  }

  private async tryUpdatePuppyOnReservation(sale: SaleLike) {
    if (!sale.puppy_id) return;
    try {
      const res = await pool.query(
        `UPDATE puppies SET status = 'RESERVED', client_id = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND status NOT IN ('RESERVED', 'SOLD', 'DEAD')
         RETURNING *`,
        [sale.client_id, sale.puppy_id]
      );
      if (res.rows.length > 0) {
        logger.info(`Filhote #${sale.puppy_id} atualizado para RESERVED via venda #${sale.id}`);
      }
    } catch (err) {
      logger.error(`Erro ao atualizar filhote #${sale.puppy_id} para RESERVED:`, { error: err, saleId: sale.id });
    }
  }

  private async tryCreateReservationTransaction(sale: SaleLike) {
    try {
      const description = `Reserva #${sale.id}`;
      const existing = await this.financialRepository.findByDescription(description, undefined);

      const txData = {
        type: 'INCOME' as const,
        category: 'OTHER',
        amount: sale.entry_value != null ? parseFloat(String(sale.entry_value)) : 0,
        date: new Date().toISOString().split('T')[0],
        description,
        status: 'PENDING' as const,
        clientId: sale.client_id,
        puppyId: sale.puppy_id,
      };

      // Garante que não coexista com uma transação de venda antiga
      // (evita dupla contagem no dashboard ao voltar reserva)
      const saleDescription = `Venda #${sale.id}`;
      const existingSale = await this.financialRepository.findByDescription(saleDescription, undefined);
      if (existingSale) {
        await this.financialRepository.delete(existingSale.id, undefined);
        logger.info(`Transação "${saleDescription}" removida ao regredir venda para PENDING.`);
      }

      if (existing) {
        // Sincroniza valor/dados com a venda atualizada
        // (preserva createdBy original)
        await this.financialRepository.update(
          existing.id,
          { ...txData, paymentMethod: existing.payment_method, dueDate: existing.due_date, paidDate: existing.paid_date, receiptUrl: existing.receipt_url },
          undefined
        );
        logger.info(`Transação financeira "${description}" sincronizada com reserva atualizada.`);
        return;
      }

      await this.financialRepository.create({ ...txData, createdBy: sale.created_by });
    } catch (err) {
      logger.error(`Erro ao criar/atualizar transação de reserva para venda #${sale.id}:`, { error: err, saleId: sale.id });
    }
  }

  private async tryUpdatePuppyOnCompletion(sale: SaleLike) {
    if (!sale.puppy_id) return;
    try {
      const res = await pool.query(
        `UPDATE puppies SET status = 'SOLD', client_id = $1, sale_date = CURRENT_DATE, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND status != 'SOLD' AND status != 'DEAD'
         RETURNING *`,
        [sale.client_id, sale.puppy_id]
      );
    } catch (err) {
      logger.error(`Erro ao atualizar status do filhote #${sale.puppy_id} para SOLD:`, { error: err, saleId: sale.id });
    }
  }

  private async resolveAnimalId(puppyId: string | null): Promise<string | null> {
    if (!puppyId) return null;
    try {
      const res = await pool.query(`
        SELECT l.mother_id AS animal_id
        FROM puppies p
        JOIN litters l ON l.id = p.litter_id
        WHERE p.id = $1
      `, [puppyId]);
      return res.rows[0]?.animal_id || null;
    } catch {
      return null;
    }
  }

  private async tryFreePuppyOnCancellation(sale: SaleLike) {
    if (!sale.puppy_id) return;
    try {
      const res = await pool.query(
        `UPDATE puppies SET status = 'AVAILABLE', client_id = NULL, sale_date = NULL, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND (status = 'RESERVED' OR status = 'SOLD')
         RETURNING *`,
        [sale.puppy_id]
      );
      if (res.rows.length > 0) {
        logger.info(`Filhote #${sale.puppy_id} liberado para AVAILABLE após cancelamento da venda #${sale.id}`);
      }
    } catch (err) {
      logger.error(`Erro ao liberar filhote #${sale.puppy_id} no cancelamento:`, { error: err, saleId: sale.id });
    }
  }

  private async tryCreateFinancialTransaction(sale: SaleLike) {
    try {
      const description = `Venda #${sale.id}`;

      // SEMPRE deleta Venda anterior (se existir) para evitar dados stale
      // O amount da Venda é derivado do total_value atual da venda, então
      // não podemos confiar em updates parciais — recriar garante consistência
      const existing = await this.financialRepository.findByDescription(description, undefined);
      const createdBy = existing?.created_by || sale.created_by;

      // Garante que não coexista com uma transação de reserva antiga
      // (evita dupla contagem no dashboard)
      const reservationDescription = `Reserva #${sale.id}`;
      const existingReservation = await this.financialRepository.findByDescription(reservationDescription, undefined);

      const animalId = await this.resolveAnimalId(sale.puppy_id);
      const txData = {
        type: 'INCOME' as const,
        category: 'OTHER',
        amount: sale.total_value || sale.entry_value || 0,
        date: sale.completed_at || new Date().toISOString().split('T')[0],
        description,
        status: 'PAID',
        clientId: sale.client_id,
        puppyId: sale.puppy_id,
        animalId,
        createdBy,
      };

      // Transação para atomicidade: delete + create são uma operação atômica
      // Se o create falhar, o delete é revertido — evitando perda de dados financeiros
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        if (existing) {
          await client.query(
            'DELETE FROM financial_transactions WHERE id = $1 AND ($2::uuid IS NULL OR created_by = $2)',
            [existing.id, null]
          );
        }

        if (existingReservation) {
          await client.query(
            'DELETE FROM financial_transactions WHERE id = $1 AND ($2::uuid IS NULL OR created_by = $2)',
            [existingReservation.id, null]
          );
        }

        await client.query(
          `INSERT INTO financial_transactions (type, category, amount, date, description, due_date, paid_date, receipt_url, status, payment_method, client_id, puppy_id, animal_id, litter_id, created_by, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, CURRENT_TIMESTAMP) RETURNING *`,
          [txData.type, txData.category || 'OTHER', txData.amount, txData.date ? new Date(txData.date) : null, txData.description || null, null, null, null, txData.status, null, txData.clientId || null, txData.puppyId || null, txData.animalId || null, null, txData.createdBy]
        );

        await client.query('COMMIT');

        if (existing) {
          logger.info(`Transação "${description}" removida para re-sync com dados atualizados.`);
        }
        if (existingReservation) {
          logger.info(`Transação "${reservationDescription}" removida ao promover venda para COMPLETED.`);
        }
        logger.info(`Transação "${description}" (RE)CRIADA com amount=${txData.amount} (sale.total_value=${sale.total_value}, entry_value=${sale.entry_value}).`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      logger.error(`Erro ao criar/atualizar transação financeira para venda #${sale.id}:`, { error: err, saleId: sale.id });
    }
  }
}
