// src/modules/notifications/controller.ts
// Controller HTTP para o módulo de notificações. Recebe req/res, valida com
// Zod, delega ao service e formata a resposta padrão da aplicação.
import { Request, Response, NextFunction } from 'express';
import { NotificationService } from './service';
import { getPaginationOptions, createPaginationMeta } from '../../shared/utils/pagination';
import { createNotificationSchema, queryNotificationSchema } from './schema';
import { isolationUserId } from '../../shared/utils/adminHelpers';
import type { NotificationFilters } from './repository';

export class NotificationController {
  private service: NotificationService;
  constructor() {
    this.service = new NotificationService();
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.markAsRead = this.markAsRead.bind(this);
    this.markAllAsRead = this.markAllAsRead.bind(this);
    this.delete = this.delete.bind(this);
  }

  public async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip, take } = getPaginationOptions(req.query as any);
      const query = queryNotificationSchema.parse(req.query);
      const filters: NotificationFilters = {};
      if (query.type) filters.type = query.type;
      if (query.unreadOnly) filters.unreadOnly = query.unreadOnly;
      const { data, total } = await this.service.getAll(skip, take, isolationUserId(req), filters);
      return res.status(200).json({
        success: true,
        message: 'Notificações listadas com sucesso.',
        data,
        meta: createPaginationMeta(total, page, limit),
      });
    } catch (error) {
      next(error);
    }
  }

  public async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.service.getById(req.params.id, isolationUserId(req));
      return res.status(200).json({ success: true, message: 'Notificação encontrada.', data });
    } catch (error) {
      next(error);
    }
  }

  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = createNotificationSchema.parse(req.body);
      const data = await this.service.create(payload);
      return res.status(201).json({
        success: true,
        message: 'Notificação criada com sucesso.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  public async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.service.markAsRead(req.params.id, isolationUserId(req));
      return res.status(200).json({
        success: true,
        message: 'Notificação marcada como lida.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  public async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = isolationUserId(req);
      const count = await this.service.markAllAsRead(userId);
      return res.status(200).json({
        success: true,
        message: `${count} notificação(ões) marcada(s) como lida(s).`,
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  }

  public async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await this.service.delete(req.params.id, isolationUserId(req));
      return res.status(200).json({ success: true, message: 'Notificação excluída.', data: null });
    } catch (error) {
      next(error);
    }
  }
}
