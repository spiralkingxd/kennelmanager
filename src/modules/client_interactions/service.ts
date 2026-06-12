import { ClientInteractionsRepository } from './repository';
import { AppError } from '../../shared/utils/AppError';
export class ClientInteractionsService {
  private repository: ClientInteractionsRepository;
  constructor() { this.repository = new ClientInteractionsRepository(); }
  public async getAll(skip: number, take: number, userId?: string) {
    const data = await this.repository.findAll(skip, take, userId);
    const total = await this.repository.count(userId);
    return { data, total };
  }
  public async getByClientId(clientId: string, userId?: string) {
    return this.repository.findByClientId(clientId, userId);
  }
  public async getById(id: string, userId?: string) {
    const data = await this.repository.findById(id, userId);
    if (!data) throw new AppError('Registro não encontrado', 404, true, 'NOT_FOUND');
    return data;
  }
  public async create(data: any) { return this.repository.create(data); }
  public async update(id: string, data: any, userId?: string) {
    await this.getById(id, userId);
    return this.repository.update(id, data, userId);
  }
  public async delete(id: string, userId?: string) {
    await this.getById(id, userId);
    return this.repository.delete(id, userId);
  }
}
