import { Request, Response, NextFunction } from 'express';
import { MessageTemplateService } from './service';
import { getPaginationOptions, createPaginationMeta } from '../../shared/utils/pagination';
import { createMessageTemplateSchema, updateMessageTemplateSchema, queryMessageTemplateSchema } from './schema';
import { AppError } from '../../shared/utils/AppError';
import { isolationUserId } from '../../shared/utils/adminHelpers';

export class MessageTemplateController {
  private service: MessageTemplateService;

  constructor() {
    this.service = new MessageTemplateService();
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  public async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip, take } = getPaginationOptions(req.query as any);
      const query = queryMessageTemplateSchema.parse(req.query);
      const filters: { category?: string; isActive?: boolean } = {};
      if (query.category) filters.category = query.category;
      if (query.isActive !== undefined) filters.isActive = query.isActive;
      const { data, total } = await this.service.getAll(skip, take, filters, isolationUserId(req));
      return res.status(200).json({ success: true, message: 'Modelos de mensagem listados com sucesso.', data, meta: createPaginationMeta(total, page, limit) });
    } catch (error) { next(error); }
  }

  public async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.service.getById(req.params.id, isolationUserId(req));
      return res.status(200).json({ success: true, message: 'Modelo de mensagem encontrado.', data });
    } catch (error) { next(error); }
  }

  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = createMessageTemplateSchema.parse(req.body);
      const data = await this.service.create({ ...payload, createdBy: req.user?.id });
      return res.status(201).json({ success: true, message: 'Modelo de mensagem criado com sucesso.', data });
    } catch (error) { next(error); }
  }

  public async update(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = updateMessageTemplateSchema.parse(req.body);
      if (Object.keys(payload).length === 0) throw new AppError('Nenhum dado válido para atualização.', 400, true);
      const data = await this.service.update(req.params.id, payload, isolationUserId(req));
      return res.status(200).json({ success: true, message: 'Modelo de mensagem atualizado com sucesso.', data });
    } catch (error) { next(error); }
  }

  public async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await this.service.delete(req.params.id, isolationUserId(req));
      return res.status(200).json({ success: true, message: 'Modelo de mensagem excluído com sucesso.', data: null });
    } catch (error) { next(error); }
  }
}
