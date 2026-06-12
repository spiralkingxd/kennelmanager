import { Router } from 'express';
import { WaitlistController } from './controller';
import { requireRole } from '../../shared/middlewares/auth';

export const waitlistRouter = Router();
const controller = new WaitlistController();

waitlistRouter.get('/', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), controller.getAll);
waitlistRouter.post('/', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), controller.create);
waitlistRouter.get('/:id', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), controller.getById);
waitlistRouter.put('/:id', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), controller.update);
waitlistRouter.delete('/:id', requireRole('ADMIN', 'CRIADOR'), controller.delete);
waitlistRouter.get('/:id/matches', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), controller.getMatches);
