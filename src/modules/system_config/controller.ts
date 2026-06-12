import { Request, Response, NextFunction } from 'express';
import { SystemConfigService } from './service';
import { updateSystemConfigSchema } from './schema';
import { AppError } from '../../shared/utils/AppError';

export class SystemConfigController {
  private service: SystemConfigService;
  constructor() {
    this.service = new SystemConfigService();
    this.getAll = this.getAll.bind(this);
    this.getByKey = this.getByKey.bind(this);
    this.upsert = this.upsert.bind(this);
    this.delete = this.delete.bind(this);
  }

  public async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.service.getAll();
      return res.status(200).json({ success: true, message: 'Configurações listadas com sucesso.', data });
    } catch (error) { next(error); }
  }

  public async getByKey(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.service.getByKey(req.params.key);
      return res.status(200).json({ success: true, message: 'Configuração encontrada.', data });
    } catch (error) { next(error); }
  }

  public async upsert(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = updateSystemConfigSchema.parse(req.body);
      if (Object.keys(payload).length === 0) throw new AppError('Nenhum dado válido para atualização.', 400, true);
      const data = await this.service.upsert(req.params.key, payload.value, payload.description, req.user!.id);
      return res.status(200).json({ success: true, message: 'Configuração salva com sucesso.', data });
    } catch (error) { next(error); }
  }

  public async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await this.service.delete(req.params.key);
      return res.status(200).json({ success: true, message: 'Configuração excluída com sucesso.', data: null });
    } catch (error) { next(error); }
  }
}
