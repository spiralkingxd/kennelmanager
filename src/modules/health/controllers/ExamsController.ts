import { Request, Response, NextFunction } from 'express';
import { HealthService } from '../service';
import { createExamSchema, updateExamSchema } from '../schema';
import { isolationUserId } from '../../../shared/utils/adminHelpers';

export function createExamsController(service: HealthService) {
  return {
    async getExams(req: Request, res: Response, next: NextFunction) {
      try {
        const userId = isolationUserId(req);
        const data = await service.getExams(req.params.animalId, userId);
        return res.status(200).json({ success: true, data });
      } catch (error) { next(error); }
    },
    async createExam(req: Request, res: Response, next: NextFunction) {
      try {
        const parsed = createExamSchema.parse(req.body);
        const payload = { ...parsed, createdBy: req.user?.id };
        const data = await service.createExam(payload);
        return res.status(201).json({ success: true, message: 'Exame registrado com sucesso.', data });
      } catch (error) { next(error); }
    },
    async updateExam(req: Request, res: Response, next: NextFunction) {
      try {
        const userId = isolationUserId(req);
        const payload = updateExamSchema.parse(req.body);
        const data = await service.updateExam(req.params.id, payload, userId);
        return res.status(200).json({ success: true, message: 'Exame atualizado com sucesso.', data });
      } catch (error) { next(error); }
    },
    async deleteExam(req: Request, res: Response, next: NextFunction) {
      try {
        const userId = isolationUserId(req);
        await service.deleteExam(req.params.id, userId);
        return res.status(200).json({ success: true, message: 'Exame excluído com sucesso.', data: null });
      } catch (error) { next(error); }
    },
  };
}
