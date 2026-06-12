import { Request, Response, NextFunction } from 'express';
import { CalendarService } from './service';
import { getPaginationOptions, createPaginationMeta } from '../../shared/utils/pagination';
import { createCalendarSchema, updateCalendarSchema } from './schema';
import { AppError } from '../../shared/utils/AppError';
import { isolationUserId } from '../../shared/utils/adminHelpers';

export class CalendarController {
  private service: CalendarService;
  constructor() {
    this.service = new CalendarService();
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }
  public async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip, take } = getPaginationOptions(req.query as any);
      const { data, total } = await this.service.getAll(skip, take, isolationUserId(req));
      return res.status(200).json({ success: true, message: 'Registros listados com sucesso.', data, meta: createPaginationMeta(total, page, limit) });
    } catch (error) { next(error); }
  }
  public async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.service.getById(req.params.id, isolationUserId(req));
      return res.status(200).json({ success: true, message: 'Registro encontrado.', data });
    } catch (error) { next(error); }
  }
  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createCalendarSchema.parse(req.body);
      const payload = {
        ...parsed,
        userId: req.user?.id,
        createdBy: req.user?.id,
      };
      const data = await this.service.create(payload);
      return res.status(201).json({ success: true, message: 'Registro criado com sucesso.', data });
    } catch (error) { next(error); }
  }
  public async update(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = updateCalendarSchema.parse(req.body);
      if (Object.keys(parsed).length === 0) throw new AppError('Nenhum dado válido para atualização.', 400, true);
      const payload = {
        ...parsed,
        userId: req.user?.id,
      };
      const data = await this.service.update(req.params.id, payload, isolationUserId(req));
      return res.status(200).json({ success: true, message: 'Registro atualizado com sucesso.', data });
    } catch (error) { next(error); }
  }
  public async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await this.service.delete(req.params.id, isolationUserId(req));
      return res.status(200).json({ success: true, message: 'Registro excluído com sucesso.', data: null });
    } catch (error) { next(error); }
  }
}
