// src/modules/litter_health_events/controller.ts
import { Request, Response, NextFunction } from 'express';
import { isolationUserId } from '../../shared/utils/adminHelpers';
import { LitterHealthEventsService } from './service';
import {
  createLitterHealthEventSchema,
  updateLitterHealthEventSchema,
} from './schema';

export class LitterHealthEventsController {
  constructor(private service = new LitterHealthEventsService()) {}

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const litterId = String(req.query.litterId || '');
      const data = await this.service.findAll(litterId, isolationUserId(req));
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.findById(req.params.id, isolationUserId(req));
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createLitterHealthEventSchema.parse(req.body);
      const data = await this.service.create(parsed, req.user?.id);
      res.status(201).json({
        success: true,
        message: `${parsed.type === 'VACCINE' ? 'Vacina' : 'Vermífugo'} registrado(a) com sucesso.`,
        data,
      });
    } catch (error) { next(error); }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = updateLitterHealthEventSchema.parse(req.body);
      const data = await this.service.update(req.params.id, parsed, isolationUserId(req));
      res.status(200).json({ success: true, message: 'Evento atualizado com sucesso.', data });
    } catch (error) { next(error); }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.delete(req.params.id, isolationUserId(req));
      res.status(200).json({ success: true, message: 'Aplicação excluída. Despesa vinculada removida.' });
    } catch (error) { next(error); }
  };
}
