import { WaitlistRepository } from './repository';
import { AppError } from '../../shared/utils/AppError';
export class WaitlistService {
  private repository: WaitlistRepository;
  constructor() { this.repository = new WaitlistRepository(); }
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
  public async create(data: any, userId?: string) {
    return this.repository.create({ ...data, createdBy: userId });
  }
  public async update(id: string, data: any, userId?: string) {
    await this.getById(id, userId);
    return this.repository.update(id, data, userId);
  }
  public async delete(id: string, userId?: string) {
    await this.getById(id, userId);
    return this.repository.delete(id, userId);
  }
  public async getMatches(id: string, userId?: string) {
    await this.getById(id, userId);
    return this.repository.findMatches(id, userId);
  }
}
