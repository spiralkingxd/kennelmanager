import { Request, Response, NextFunction } from 'express';
import { HealthService } from '../service';
import { createMatingSchema, updateMatingSchema } from '../schema';
import { isolationUserId } from '../../../shared/utils/adminHelpers';

export function createMatingsController(service: HealthService) {
  return {
    async getMatings(req: Request, res: Response, next: NextFunction) {
      try {
        const userId = isolationUserId(req);
        const data = await service.getMatings(req.params.animalId, userId);
        return res.status(200).json({ success: true, data });
      } catch (error) { next(error); }
    },
    async createMating(req: Request, res: Response, next: NextFunction) {
      try {
        const parsed = createMatingSchema.parse(req.body);
        const payload = { ...parsed, createdBy: req.user?.id };
        const data = await service.createMating(payload);
        return res.status(201).json({ success: true, message: 'Cobertura registrada com sucesso.', data });
      } catch (error) { next(error); }
    },
    async updateMating(req: Request, res: Response, next: NextFunction) {
      try {
        const userId = isolationUserId(req);
        const payload = updateMatingSchema.parse(req.body);
        const data = await service.updateMating(req.params.id, payload, userId);
        return res.status(200).json({ success: true, message: 'Cobertura atualizada com sucesso.', data });
      } catch (error) { next(error); }
    },
    async deleteMating(req: Request, res: Response, next: NextFunction) {
      try {
        const userId = isolationUserId(req);
        await service.deleteMating(req.params.id, userId);
        return res.status(200).json({ success: true, message: 'Cobertura excluída com sucesso.', data: null });
      } catch (error) { next(error); }
    },
  };
}
