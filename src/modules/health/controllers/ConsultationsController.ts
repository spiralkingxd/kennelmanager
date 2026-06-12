import { Request, Response, NextFunction } from 'express';
import { HealthService } from '../service';
import { createConsultationSchema, updateConsultationSchema } from '../schema';
import { isolationUserId } from '../../../shared/utils/adminHelpers';

export function createConsultationsController(service: HealthService) {
  return {
    async getConsultations(req: Request, res: Response, next: NextFunction) {
      try {
        const userId = isolationUserId(req);
        const data = await service.getConsultations(req.params.animalId, userId);
        return res.status(200).json({ success: true, data });
      } catch (error) { next(error); }
    },
    async createConsultation(req: Request, res: Response, next: NextFunction) {
      try {
        const parsed = createConsultationSchema.parse(req.body);
        const payload = { ...parsed, createdBy: req.user?.id };
        const data = await service.createConsultation(payload);
        return res.status(201).json({ success: true, message: 'Consulta registrada com sucesso.', data });
      } catch (error) { next(error); }
    },
    async updateConsultation(req: Request, res: Response, next: NextFunction) {
      try {
        const userId = isolationUserId(req);
        const payload = updateConsultationSchema.parse(req.body);
        const data = await service.updateConsultation(req.params.id, payload, userId);
        return res.status(200).json({ success: true, message: 'Consulta atualizada com sucesso.', data });
      } catch (error) { next(error); }
    },
    async deleteConsultation(req: Request, res: Response, next: NextFunction) {
      try {
        const userId = isolationUserId(req);
        await service.deleteConsultation(req.params.id, userId);
        return res.status(200).json({ success: true, message: 'Consulta excluída com sucesso.', data: null });
      } catch (error) { next(error); }
    },
  };
}
