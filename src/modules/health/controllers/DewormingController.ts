import { Request, Response, NextFunction } from 'express';
import { HealthService } from '../service';
import { createDewormingSchema, updateDewormingSchema } from '../schema';
import { isolationUserId } from '../../../shared/utils/adminHelpers';

export function createDewormingController(service: HealthService) {
  return {
    async getDeworming(req: Request, res: Response, next: NextFunction) {
      try {
        const userId = isolationUserId(req);
        const data = await service.getDeworming(req.params.animalId, userId);
        return res.status(200).json({ success: true, data });
      } catch (error) { next(error); }
    },
    async createDeworming(req: Request, res: Response, next: NextFunction) {
      try {
        const parsed = createDewormingSchema.parse(req.body);
        const payload = { ...parsed, createdBy: req.user?.id };
        const data = await service.createDeworming(payload);
        return res.status(201).json({ success: true, message: 'Vermífugo registrado com sucesso.', data });
      } catch (error) { next(error); }
    },
    async updateDeworming(req: Request, res: Response, next: NextFunction) {
      try {
        const userId = isolationUserId(req);
        const payload = updateDewormingSchema.parse(req.body);
        const data = await service.updateDeworming(req.params.id, payload, userId);
        return res.status(200).json({ success: true, message: 'Vermífugo atualizado com sucesso.', data });
      } catch (error) { next(error); }
    },
    async deleteDeworming(req: Request, res: Response, next: NextFunction) {
      try {
        const userId = isolationUserId(req);
        await service.deleteDeworming(req.params.id, userId);
        return res.status(200).json({ success: true, message: 'Vermífugo excluído com sucesso.', data: null });
      } catch (error) { next(error); }
    },
  };
}
