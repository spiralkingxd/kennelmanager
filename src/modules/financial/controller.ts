import { Request, Response, NextFunction } from 'express';
import { FinancialService } from './service';
import { getPaginationOptions, createPaginationMeta } from '../../shared/utils/pagination';
import { createFinancialSchema, updateFinancialSchema, queryFinancialSchema } from './schema';
import { AppError } from '../../shared/utils/AppError';
import { isolationUserId } from '../../shared/utils/adminHelpers';

export class FinancialController {
  private service: FinancialService;
  constructor() {
    this.service = new FinancialService();
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }
  public async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip, take } = getPaginationOptions(req.query as any);
      const query = queryFinancialSchema.parse(req.query);
      const filters: { clientId?: string; animalId?: string; litterId?: string } = {};
      if (query.clientId) filters.clientId = query.clientId;
      if (query.animalId) filters.animalId = query.animalId;
      if (query.litterId) filters.litterId = query.litterId;
      const { data, total } = await this.service.getAll(skip, take, filters, isolationUserId(req));
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
      const payload = createFinancialSchema.parse(req.body);
      const data = await this.service.create({ ...payload, createdBy: req.user?.id });
      return res.status(201).json({ success: true, message: 'Registro criado com sucesso.', data });
    } catch (error) { next(error); }
  }
  public async update(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = updateFinancialSchema.parse(req.body);
      if (Object.keys(payload).length === 0) throw new AppError('Nenhum dado válido para atualização.', 400, true);
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
