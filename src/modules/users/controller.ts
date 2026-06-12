import { Request, Response, NextFunction } from 'express';
import { UsersService } from './service';
import { getPaginationOptions, createPaginationMeta } from '../../shared/utils/pagination';
import { createUsersSchema, updateUsersSchema } from './schema';
import { AppError } from '../../shared/utils/AppError';
import { isolationUserId } from '../../shared/utils/adminHelpers';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@admin.com';

export class UsersController {
  private service: UsersService;
  constructor() {
    this.service = new UsersService();
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }
  public async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip, take } = getPaginationOptions(req.query as any);
      // Admins see ALL users; non-admins see only their own
      const { data, total } = await this.service.getAll(skip, take, isolationUserId(req));
      // Mark the protected admin user (from .env) so the frontend knows which user is absolute
      const enrichedData = data.map((u: any) => ({
        ...u,
        isProtected: u.email === ADMIN_EMAIL,
      }));
      return res.status(200).json({ success: true, message: 'Registros listados com sucesso.', data: enrichedData, meta: createPaginationMeta(total, page, limit) });
    } catch (error) { next(error); }
  }
  public async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.service.getById(req.params.id, isolationUserId(req));
      return res.status(200).json({ success: true, message: 'Registro encontrado.', data: { ...data, isProtected: data?.email === ADMIN_EMAIL } });
    } catch (error) { next(error); }
  }
  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = createUsersSchema.parse(req.body);
      const data = await this.service.create({ ...payload, createdBy: req.user?.id });
      return res.status(201).json({ success: true, message: 'Registro criado com sucesso.', data });
    } catch (error) { next(error); }
  }
  public async update(req: Request, res: Response, next: NextFunction) {
    try {
      const targetUser = await this.service.getById(req.params.id, isolationUserId(req));
      const payload = updateUsersSchema.parse(req.body);
      if (Object.keys(payload).length === 0) throw new AppError('Nenhum dado válido para atualização.', 400, true);
      if (targetUser?.email === ADMIN_EMAIL) {
        if (req.user?.role !== 'ADMIN') {
          throw new AppError('O administrador principal não pode ser modificado.', 403, true, 'PROTECTED_ADMIN');
        }
        const allowedKeys = ['status'];
        const disallowedKeys = Object.keys(payload).filter(k => !allowedKeys.includes(k));
        if (disallowedKeys.length > 0) {
          throw new AppError('Apenas o campo status pode ser alterado no administrador principal.', 403, true, 'PROTECTED_ADMIN_FIELDS');
        }
      }
      const data = await this.service.update(req.params.id, payload, isolationUserId(req));
      return res.status(200).json({ success: true, message: 'Registro atualizado com sucesso.', data });
    } catch (error) { next(error); }
  }
  public async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const targetUser = await this.service.getById(req.params.id, isolationUserId(req));
      if (targetUser?.email === ADMIN_EMAIL) {
        throw new AppError('O administrador principal não pode ser removido.', 403, true, 'PROTECTED_ADMIN');
      }
      await this.service.delete(req.params.id, isolationUserId(req));
      return res.status(200).json({ success: true, message: 'Registro excluído com sucesso.', data: null });
    } catch (error) { next(error); }
  }
}
