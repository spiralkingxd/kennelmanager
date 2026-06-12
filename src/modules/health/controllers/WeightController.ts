import { Request, Response, NextFunction } from 'express';
import { HealthService } from '../service';
import { createWeightSchema } from '../schema';
import { isolationUserId } from '../../../shared/utils/adminHelpers';

export function createWeightController(service: HealthService) {
  return {
    async getWeightHistory(req: Request, res: Response, next: NextFunction) {
      try {
        const userId = isolationUserId(req);
        const data = await service.getWeightHistory(req.params.animalId, userId);
        return res.status(200).json({ success: true, data });
      } catch (error) { next(error); }
    },
    async createWeight(req: Request, res: Response, next: NextFunction) {
      try {
        const parsed = createWeightSchema.parse(req.body);
        const payload = { ...parsed, createdBy: req.user?.id };
        const data = await service.createWeight(payload);
        return res.status(201).json({ success: true, message: 'Peso registrado com sucesso.', data });
      } catch (error) { next(error); }
    },
    async deleteWeight(req: Request, res: Response, next: NextFunction) {
      try {
        const userId = isolationUserId(req);
        await service.deleteWeight(req.params.id, userId);
        return res.status(200).json({ success: true, message: 'Registro de peso excluído com sucesso.', data: null });
      } catch (error) { next(error); }
    },
  };
}
