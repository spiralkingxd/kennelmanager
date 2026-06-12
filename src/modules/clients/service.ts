import { pool } from '../../shared/config/db';
import { ClientsRepository } from './repository';
import { AppError } from '../../shared/utils/AppError';
export class ClientsService {
  private repository: ClientsRepository;
  constructor() { this.repository = new ClientsRepository(); }
  public async search(query: string, userId?: string) { return this.repository.search(query, userId); }
  public async getImpact(id: string, userId?: string) {
    return this.repository.getImpactDetails(id, userId);
  }
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
  public async create(data: any) { return this.repository.create(data); }
  public async update(id: string, data: any, userId?: string) {
    await this.getById(id, userId); // ensure exists and belongs to user
    return this.repository.update(id, data, userId);
  }
  public async delete(id: string, userId?: string) {
    await this.getById(id, userId); // ensure exists and belongs to user
    const impact = await this.repository.getImpactDetails(id, userId);
    if (impact.hasActiveNegotiations) {
      throw new AppError(
        'Cliente possui negociações ativas no Funil de Vendas. Finalize ou cancele as negociações antes de excluir.',
        409, true, 'ACTIVE_NEGOTIATIONS'
      );
    }
    const salesCount = impact.counts.sales;
    if (salesCount > 0) {
      throw new AppError(
        'Cliente possui vendas associadas. Exclua ou remova as vendas antes de excluir o cliente.',
        409, true, 'HAS_SALES'
      );
    }
    const deleted = await this.repository.delete(id, userId);
    return deleted;
  }

  public async getBulkImpactDetails(ids: string[], userId?: string) {
    return this.repository.getBulkImpactDetails(ids, userId);
  }

  public async bulkDelete(ids: string[], userId?: string) {
    for (const id of ids) {
      await this.getById(id, userId);
    }

    const impact = await this.repository.getBulkImpactDetails(ids, userId);
    if (impact.hasActiveNegotiations) {
      const blockedNames = impact.clients
        .filter((c: any) => c.hasActiveNegotiations)
        .map((c: any) => c.name);
      throw new AppError(
        `Cliente(s) com negociações ativas no Funil de Vendas: ${blockedNames.join(', ')}. Finalize ou cancele antes de excluir.`,
        409, true, 'ACTIVE_NEGOTIATIONS'
      );
    }

    return this.repository.bulkDelete(ids, userId);
  }
}
