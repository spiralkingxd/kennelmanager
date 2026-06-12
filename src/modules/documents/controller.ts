import { Request, Response, NextFunction } from 'express';
import { DocumentsService } from './service';
import { createDocumentSchema, updateDocumentSchema } from './schema';
import { getPaginationOptions, createPaginationMeta } from '../../shared/utils/pagination';
import { isolationUserId } from '../../shared/utils/adminHelpers';

export class DocumentsController {
  private service: DocumentsService;
  constructor() {
    this.service = new DocumentsService();
    this.getAll = this.getAll.bind(this);
    this.getByAnimal = this.getByAnimal.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  public async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip, take } = getPaginationOptions(req.query as any);
      const { data, total } = await this.service.getAll(skip, take, isolationUserId(req));
      return res.status(200).json({ success: true, message: 'Documentos listados com sucesso.', data, meta: createPaginationMeta(total, page, limit) });
    } catch (error) { next(error); }
  }

  public async getByAnimal(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.service.getByAnimal(req.params.animalId, isolationUserId(req));
      return res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  }

  public async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.service.getById(req.params.id, isolationUserId(req));
      return res.status(200).json({ success: true, message: 'Documento encontrado.', data });
    } catch (error) { next(error); }
  }

  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createDocumentSchema.parse(req.body);
      const payload = { ...parsed, uploadedBy: req.user?.id };
      const data = await this.service.create(payload);
      return res.status(201).json({ success: true, message: 'Documento cadastrado com sucesso.', data });
    } catch (error) { next(error); }
  }

  public async update(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = updateDocumentSchema.parse(req.body);
      const data = await this.service.update(req.params.id, parsed, isolationUserId(req));
      return res.status(200).json({ success: true, message: 'Documento atualizado com sucesso.', data });
    } catch (error) { next(error); }
  }

  public async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await this.service.delete(req.params.id, isolationUserId(req));
      return res.status(200).json({ success: true, message: 'Documento excluído com sucesso.', data: null });
    } catch (error) { next(error); }
  }
}
