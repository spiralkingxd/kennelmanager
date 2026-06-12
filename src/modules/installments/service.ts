import { InstallmentRepository } from './repository';
import { AppError } from '../../shared/utils/AppError';

export class InstallmentService {
  private repository: InstallmentRepository;

  constructor() {
    this.repository = new InstallmentRepository();
  }

  public async getAll(skip: number, take: number, filters?: { transactionId?: string; status?: string }, userId?: string) {
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
    return this.repository.create(data);
  }

  public async update(id: string, data: any, userId?: string) {
    await this.getById(id, userId);
    return this.repository.update(id, data, userId);
  }

  public async delete(id: string, userId?: string) {
    await this.getById(id, userId);
    return this.repository.delete(id, userId);
  }
}
