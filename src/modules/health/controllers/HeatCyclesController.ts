import { Request, Response, NextFunction } from 'express';
import { HealthService } from '../service';
import { createHeatCycleSchema, updateHeatCycleSchema } from '../schema';
import { isolationUserId } from '../../../shared/utils/adminHelpers';

export function createHeatCyclesController(service: HealthService) {
  return {
    async getHeatCycles(req: Request, res: Response, next: NextFunction) {
      try {
        const userId = isolationUserId(req);
        const data = await service.getHeatCycles(req.params.animalId, userId);
        return res.status(200).json({ success: true, data });
      } catch (error) { next(error); }
    },
    async createHeatCycle(req: Request, res: Response, next: NextFunction) {
      try {
        const parsed = createHeatCycleSchema.parse(req.body);
        const payload = { ...parsed, createdBy: req.user?.id };
        const data = await service.createHeatCycle(payload);
        return res.status(201).json({ success: true, message: 'Ciclo de cio registrado com sucesso.', data });
      } catch (error) { next(error); }
    },
    async updateHeatCycle(req: Request, res: Response, next: NextFunction) {
      try {
        const userId = isolationUserId(req);
        const payload = updateHeatCycleSchema.parse(req.body);
        const data = await service.updateHeatCycle(req.params.id, payload, userId);
        return res.status(200).json({ success: true, message: 'Ciclo de cio atualizado com sucesso.', data });
      } catch (error) { next(error); }
    },
    async deleteHeatCycle(req: Request, res: Response, next: NextFunction) {
      try {
        const userId = isolationUserId(req);
        await service.deleteHeatCycle(req.params.id, userId);
        return res.status(200).json({ success: true, message: 'Ciclo de cio excluído com sucesso.', data: null });
      } catch (error) { next(error); }
    },
  };
}
