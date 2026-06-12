import { Request, Response, NextFunction } from 'express';
import { HealthService } from '../service';
import { createGestationSchema, updateGestationSchema } from '../schema';
import { isolationUserId } from '../../../shared/utils/adminHelpers';

export function createGestationsController(service: HealthService) {
  return {
    async getGestations(req: Request, res: Response, next: NextFunction) {
      try {
        const userId = isolationUserId(req);
        const data = await service.getGestations(req.params.animalId, userId);
        return res.status(200).json({ success: true, data });
      } catch (error) { next(error); }
    },
    async getActiveGestation(req: Request, res: Response, next: NextFunction) {
      try {
        const userId = isolationUserId(req);
        const data = await service.getActiveGestation(req.params.animalId, userId);
        return res.status(200).json({ success: true, data });
      } catch (error) { next(error); }
    },
    async createGestation(req: Request, res: Response, next: NextFunction) {
      try {
        const parsed = createGestationSchema.parse(req.body);
        const payload = { ...parsed, createdBy: req.user?.id };
        const data = await service.createGestation(payload);
        return res.status(201).json({ success: true, message: 'Gestação registrada com sucesso.', data });
      } catch (error) { next(error); }
    },
    async updateGestation(req: Request, res: Response, next: NextFunction) {
      try {
        const userId = isolationUserId(req);
        const payload = updateGestationSchema.parse(req.body);
        const data = await service.updateGestation(req.params.id, payload, userId);
        return res.status(200).json({ success: true, message: 'Gestação atualizada com sucesso.', data });
      } catch (error) { next(error); }
    },
    async deleteGestation(req: Request, res: Response, next: NextFunction) {
      try {
        const userId = isolationUserId(req);
        await service.deleteGestation(req.params.id, userId);
        return res.status(200).json({ success: true, message: 'Gestação excluída com sucesso.', data: null });
      } catch (error) { next(error); }
    },
  };
}
