import { Request, Response, NextFunction } from 'express';
import { SalesService } from './service';
import { createPaginationMeta } from '../../shared/utils/pagination';
import { createSaleSchema, updateSaleSchema, querySalesSchema } from './schema';
import { AppError } from '../../shared/utils/AppError';
import { isolationUserId } from '../../shared/utils/adminHelpers';

export class SalesController {
  private service: SalesService;
  constructor() {
    this.service = new SalesService();
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }
  public async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = querySalesSchema.parse(req.query);
      const skip = (page - 1) * limit;
      const { data, total } = await this.service.getAll(skip, limit, isolationUserId(req));
      return res.status(200).json({ success: true, message: 'Vendas listadas com sucesso.', data, meta: createPaginationMeta(total, page, limit) });
    } catch (error) { next(error); }
  }
  public async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.service.getById(req.params.id, isolationUserId(req));
      return res.status(200).json({ success: true, message: 'Venda encontrada.', data });
    } catch (error) { next(error); }
  }
  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = createSaleSchema.parse(req.body);
      const data = await this.service.create({ ...payload, createdBy: req.user?.id });
      return res.status(201).json({ success: true, message: 'Venda registrada com sucesso.', data });
    } catch (error) { next(error); }
  }
  public async update(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = updateSaleSchema.parse(req.body);
      if (Object.keys(payload).length === 0) throw new AppError('Nenhum dado válido para atualização.', 400, true);
      const data = await this.service.update(req.params.id, payload, isolationUserId(req));
      return res.status(200).json({ success: true, message: 'Venda atualizada com sucesso.', data });
    } catch (error) { next(error); }
  }
  public async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await this.service.delete(req.params.id, isolationUserId(req));
      return res.status(200).json({ success: true, message: 'Venda excluída com sucesso.', data: null });
    } catch (error) { next(error); }
  }
}
