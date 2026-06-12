import { Request, Response, NextFunction } from 'express';
import { HealthService } from '../service';
import { createMedicationSchema, updateMedicationSchema } from '../schema';
import { isolationUserId } from '../../../shared/utils/adminHelpers';

export function createMedicationsController(service: HealthService) {
  return {
    async getMedications(req: Request, res: Response, next: NextFunction) {
      try {
        const userId = isolationUserId(req);
        const data = await service.getMedications(req.params.animalId, userId);
        return res.status(200).json({ success: true, data });
      } catch (error) { next(error); }
    },
    async createMedication(req: Request, res: Response, next: NextFunction) {
      try {
        const parsed = createMedicationSchema.parse(req.body);
        const payload = { ...parsed, createdBy: req.user?.id };
        const data = await service.createMedication(payload);
        return res.status(201).json({ success: true, message: 'Medicação registrada com sucesso.', data });
      } catch (error) { next(error); }
    },
    async updateMedication(req: Request, res: Response, next: NextFunction) {
      try {
        const userId = isolationUserId(req);
        const payload = updateMedicationSchema.parse(req.body);
        const data = await service.updateMedication(req.params.id, payload, userId);
        return res.status(200).json({ success: true, message: 'Medicação atualizada com sucesso.', data });
      } catch (error) { next(error); }
    },
    async deleteMedication(req: Request, res: Response, next: NextFunction) {
      try {
        const userId = isolationUserId(req);
        await service.deleteMedication(req.params.id, userId);
        return res.status(200).json({ success: true, message: 'Medicação excluída com sucesso.', data: null });
      } catch (error) { next(error); }
    },
  };
}
