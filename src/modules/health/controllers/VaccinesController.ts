import { Request, Response, NextFunction } from 'express';
import { HealthService } from '../service';
import { createVaccineSchema, updateVaccineSchema } from '../schema';
import { isolationUserId } from '../../../shared/utils/adminHelpers';

export function createVaccinesController(service: HealthService) {
  return {
    async getVaccines(req: Request, res: Response, next: NextFunction) {
      try {
        const userId = isolationUserId(req);
        const data = await service.getVaccines(req.params.animalId, userId);
        return res.status(200).json({ success: true, data });
      } catch (error) { next(error); }
    },
    async createVaccine(req: Request, res: Response, next: NextFunction) {
      try {
        const parsed = createVaccineSchema.parse(req.body);
        const payload = { ...parsed, createdBy: req.user?.id };
        const data = await service.createVaccine(payload);
        return res.status(201).json({ success: true, message: 'Vacina registrada com sucesso.', data });
      } catch (error) { next(error); }
    },
    async updateVaccine(req: Request, res: Response, next: NextFunction) {
      try {
        const userId = isolationUserId(req);
        const payload = updateVaccineSchema.parse(req.body);
        const data = await service.updateVaccine(req.params.id, payload, userId);
        return res.status(200).json({ success: true, message: 'Vacina atualizada com sucesso.', data });
      } catch (error) { next(error); }
    },
    async deleteVaccine(req: Request, res: Response, next: NextFunction) {
      try {
        const userId = isolationUserId(req);
        await service.deleteVaccine(req.params.id, userId);
        return res.status(200).json({ success: true, message: 'Vacina excluída com sucesso.', data: null });
      } catch (error) { next(error); }
    },
  };
}
