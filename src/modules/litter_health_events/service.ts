// src/modules/litter_health_events/service.ts
import { AppError } from '../../shared/utils/AppError';
import { logger } from '../../config/winston';
import { LitterHealthEventsRepository } from './repository';
import { FinancialRepository } from '../financial/repository';
import type { CreateLitterHealthEventInput, UpdateLitterHealthEventInput } from './schema';

export class LitterHealthEventsService {
  constructor(
    private repo = new LitterHealthEventsRepository(),
    private financialRepo = new FinancialRepository(),
  ) {}

  async findAll(litterId: string, userId?: string) {
    if (!litterId) {
      throw new AppError('litterId é obrigatório', 400, true, 'BAD_REQUEST');
    }
    return this.repo.findAll(litterId, userId);
  }

  async findById(id: string, userId?: string) {
    const event = await this.repo.findById(id, userId);
    if (!event) {
      throw new AppError('Evento de saúde não encontrado', 404, true, 'NOT_FOUND');
    }
    return event;
  }

  async create(data: CreateLitterHealthEventInput, userId?: string) {
    const created = await this.repo.create({ ...data, createdBy: userId });
    await this.syncFinancialTransaction(
      created.id,
      created.type,
      created.name,
      created.date,
      created.amount,
      created.litter_id,
      userId,
    );
    return created;
  }

  async update(id: string, data: UpdateLitterHealthEventInput, userId?: string) {
    const updated = await this.repo.update(id, data, userId);
    if (!updated) {
      throw new AppError('Evento de saúde não encontrado', 404, true, 'NOT_FOUND');
    }

    // Always delete any existing linked transaction first (handles rename/type-change)
    await this.deleteLinkedTransaction(updated.id, updated.type, updated.name, userId);

    // Then sync (will create a new one if amount is present)
    await this.syncFinancialTransaction(
      updated.id,
      updated.type,
      updated.name,
      updated.date,
      updated.amount,
      updated.litter_id,
      userId,
    );

    return updated;
  }

  async delete(id: string, userId?: string) {
    const event = await this.repo.findById(id, userId);
    if (event) {
      await this.deleteLinkedTransaction(id, event.type, event.name, userId);
    }
    const ok = await this.repo.delete(id, userId);
    if (!ok) {
      throw new AppError('Evento de saúde não encontrado', 404, true, 'NOT_FOUND');
    }
  }

  private async syncFinancialTransaction(
    eventId: string,
    type: 'VACCINE' | 'DEWORMING',
    name: string,
    date: string,
    amount: number | null | undefined,
    litterId: string,
    createdBy?: string,
  ): Promise<void> {
    if (!amount) return;

    const category = type === 'VACCINE' ? 'VACCINES' : 'DEWORMING';
    const prefix = type === 'VACCINE' ? 'Vacina' : 'Vermífugo';
    const description = `${prefix} #${eventId}: ${name}`;

    try {
      const existing = await this.financialRepo.findByDescription(description, createdBy);
      if (existing) {
        await this.financialRepo.update(
          existing.id,
          {
            type: 'EXPENSE',
            amount,
            category,
            description,
            date,
            litterId,
            status: 'PAID',
          },
          createdBy,
        );
      } else {
        await this.financialRepo.create({
          type: 'EXPENSE',
          category,
          amount,
          date,
          description,
          status: 'PAID',
          litterId,
          paymentMethod: 'CASH',
          createdBy,
        });
      }
    } catch (err) {
      logger.error('Falha ao sincronizar transação financeira:', { err, eventId });
      // Não quebra o fluxo principal
    }
  }

  private async deleteLinkedTransaction(
    eventId: string,
    type: 'VACCINE' | 'DEWORMING',
    name: string,
    userId?: string,
  ): Promise<void> {
    try {
      const prefix = type === 'VACCINE' ? 'Vacina' : 'Vermífugo';
      const description = `${prefix} #${eventId}: ${name}`;
      const tx = await this.financialRepo.findByDescription(description, userId);
      if (tx) {
        await this.financialRepo.delete(tx.id, userId);
      }
    } catch (err) {
      logger.error('Falha ao deletar transação vinculada:', { err, eventId });
    }
  }
}
