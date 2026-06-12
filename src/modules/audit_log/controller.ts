import { Request, Response, NextFunction } from 'express';
import { AuditLogService } from './service';
import { getPaginationOptions, createPaginationMeta } from '../../shared/utils/pagination';
import { createAuditLogSchema, queryAuditLogSchema } from './schema';
import { isolationUserId } from '../../shared/utils/adminHelpers';

export class AuditLogController {
  private service: AuditLogService;
  constructor() {
    this.service = new AuditLogService();
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
  }

  public async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip, take } = getPaginationOptions(req.query as any);
      const query = queryAuditLogSchema.parse(req.query);
      // Admins see ALL audit logs; non-admins see only their own
      const filters: { entityType?: string; action?: string; userId?: string; startDate?: string; endDate?: string } = {};
      if (query.entityType) filters.entityType = query.entityType;
      if (query.action) filters.action = query.action;
      if (query.userId) filters.userId = query.userId;
      if (query.startDate) filters.startDate = query.startDate;
      if (query.endDate) filters.endDate = query.endDate;
      const { data, total } = await this.service.getAll(skip, take, isolationUserId(req), filters);
      return res.status(200).json({ success: true, message: 'Registros de auditoria listados com sucesso.', data, meta: createPaginationMeta(total, page, limit) });
    } catch (error) { next(error); }
  }

  public async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.service.getById(req.params.id, isolationUserId(req));
      return res.status(200).json({ success: true, message: 'Registro de auditoria encontrado.', data });
    } catch (error) { next(error); }
  }

  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = createAuditLogSchema.parse(req.body);
      const data = await this.service.create({ ...payload, userId: req.user?.id });
      return res.status(201).json({ success: true, message: 'Registro de auditoria criado com sucesso.', data });
    } catch (error) { next(error); }
  }
}
