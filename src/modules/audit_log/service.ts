import { AuditLogRepository, AuditFilters } from './repository';
import { AppError } from '../../shared/utils/AppError';

export class AuditLogService {
  private repository: AuditLogRepository;
  constructor() { this.repository = new AuditLogRepository(); }

  public async getAll(skip: number, take: number, userId?: string, filters?: AuditFilters) {
    const data = await this.repository.findAll(skip, take, userId, filters);
    const total = await this.repository.count(userId, filters);
    return { data, total };
  }

  public async getById(id: string, userId?: string) {
    const data = await this.repository.findById(id, userId);
    if (!data) throw new AppError('Registro de auditoria não encontrado', 404, true, 'NOT_FOUND');
    return data;
  }

  public async create(data: any) {
    return this.repository.create(data);
  }
}
