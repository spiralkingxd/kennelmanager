import { PuppiesRepository } from '../../puppies/repository';
import type { Logger } from 'winston';
import type { SaleLike } from './types';

const puppiesRepository = new PuppiesRepository();

/**
 * Reserva o filhote vinculado à venda.
 * Idempotente: só atualiza se o status atual for diferente de RESERVED.
 */
export async function reservePuppyOnSale(
  sale: SaleLike,
  logger: Logger
): Promise<void> {
  if (!sale.puppy_id) return;
  try {
    const current = await puppiesRepository.findById(sale.puppy_id);
    if (current && current.status !== 'RESERVED') {
      await puppiesRepository.update(sale.puppy_id, {
        status: 'RESERVED',
        clientId: sale.client_id,
      });
      logger.info(`Filhote #${sale.puppy_id} atualizado para RESERVED via venda #${sale.id}`);
    }
  } catch (err) {
    logger.error(`Erro ao atualizar filhote #${sale.puppy_id} para RESERVED:`, { error: err, saleId: sale.id });
  }
}

/**
 * Marca o filhote como vendido quando a venda é concluída.
 * Idempotente: só atualiza se o status atual for diferente de SOLD.
 */
export async function markPuppySoldOnCompletion(
  sale: SaleLike,
  logger: Logger
): Promise<void> {
  if (!sale.puppy_id) return;
  try {
    const current = await puppiesRepository.findById(sale.puppy_id);
    if (current && current.status !== 'SOLD') {
      await puppiesRepository.update(sale.puppy_id, {
        status: 'SOLD',
        clientId: sale.client_id,
      });
    }
  } catch (err) {
    logger.error(`Erro ao atualizar status do filhote #${sale.puppy_id} para SOLD:`, { error: err, saleId: sale.id });
  }
}

/**
 * Libera o filhote ao cancelar a venda (volta para AVAILABLE).
 * Só libera se o filhote estava RESERVED ou SOLD por esta venda.
 */
export async function freePuppyOnCancellation(
  sale: SaleLike,
  logger: Logger
): Promise<void> {
  if (!sale.puppy_id) return;
  try {
    const puppy = await puppiesRepository.findById(sale.puppy_id);
    if (puppy && (puppy.status === 'RESERVED' || puppy.status === 'SOLD')) {
      await puppiesRepository.update(sale.puppy_id, {
        status: 'AVAILABLE',
        clientId: null,
        saleDate: null,
      });
      logger.info(`Filhote #${sale.puppy_id} liberado para AVAILABLE após cancelamento da venda #${sale.id}`);
    }
  } catch (err) {
    logger.error(`Erro ao liberar filhote #${sale.puppy_id} no cancelamento:`, { error: err, saleId: sale.id });
  }
}
