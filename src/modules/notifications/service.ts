// src/modules/notifications/service.ts
// Camada de negócio para notificações. Encapsula o repository e aplica
// validações de borda (userId obrigatório em markAllAsRead).
import { AppError } from '../../shared/utils/AppError';
import { NotificationRepository, NotificationFilters } from './repository';
import type { CreateNotificationInput } from './schema';

export class NotificationService {
  constructor(private repo = new NotificationRepository()) {}

  public async getAll(
    skip: number,
    take: number,
    userId?: string,
    filters?: NotificationFilters,
  ) {
    const data = await this.repo.findAll(skip, take, userId, filters);
    const total = await this.repo.count(userId, filters);
    return { data, total };
  }

  public async getById(id: string, userId?: string) {
    const data = await this.repo.findById(id, userId);
    if (!data) {
      throw new AppError('Notificação não encontrada', 404, true, 'NOT_FOUND');
    }
    return data;
  }

  public async create(data: CreateNotificationInput) {
    return this.repo.create(data);
  }

  public async markAsRead(id: string, userId?: string) {
    const data = await this.repo.markAsRead(id, userId);
    if (!data) {
      throw new AppError('Notificação não encontrada', 404, true, 'NOT_FOUND');
    }
    return data;
  }

  public async markAllAsRead(userId?: string): Promise<number> {
    if (!userId) {
      throw new AppError('userId é obrigatório para esta operação', 400, true, 'BAD_REQUEST');
    }
    return this.repo.markAllAsRead(userId);
  }

  public async delete(id: string, userId?: string) {
    const ok = await this.repo.delete(id, userId);
    if (!ok) {
      throw new AppError('Notificação não encontrada', 404, true, 'NOT_FOUND');
    }
  }
}
