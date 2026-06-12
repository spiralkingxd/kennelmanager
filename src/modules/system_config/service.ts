import { SystemConfigRepository } from './repository';
import { AppError } from '../../shared/utils/AppError';

export class SystemConfigService {
  private repository: SystemConfigRepository;
  constructor() { this.repository = new SystemConfigRepository(); }

  public async getAll() {
    return this.repository.findAll();
  }

  public async getByKey(key: string) {
    const data = await this.repository.findByKey(key);
    if (!data) throw new AppError('Configuração não encontrada', 404, true, 'NOT_FOUND');
    return data;
  }

  public async upsert(key: string, value: any, description: string | undefined, updatedBy: string) {
    return this.repository.upsert(key, value, description || null, updatedBy);
  }

  public async delete(key: string) {
    const data = await this.repository.delete(key);
    if (!data) throw new AppError('Configuração não encontrada', 404, true, 'NOT_FOUND');
    return data;
  }
}
