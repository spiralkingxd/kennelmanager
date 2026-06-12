import { Router } from 'express';
import { ClientInteractionsController } from './controller';
import { requireRole } from '../../shared/middlewares/auth';

export const clientInteractionsRouter = Router();
const controller = new ClientInteractionsController();

clientInteractionsRouter.get('/', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), controller.getAll);
clientInteractionsRouter.post('/', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), controller.create);
clientInteractionsRouter.get('/client/:clientId', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), controller.getByClient);
clientInteractionsRouter.get('/:id', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), controller.getById);
clientInteractionsRouter.put('/:id', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), controller.update);
clientInteractionsRouter.delete('/:id', requireRole('ADMIN', 'CRIADOR'), controller.delete);
