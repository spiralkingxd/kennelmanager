import { Router } from 'express';
import { SalesController } from './controller';
import { requireRole } from '../../shared/middlewares/auth';

export const salesRouter = Router();
const controller = new SalesController();

salesRouter.get('/', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), controller.getAll);
salesRouter.post('/', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), controller.create);
salesRouter.get('/:id', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), controller.getById);
salesRouter.put('/:id', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), controller.update);
salesRouter.delete('/:id', requireRole('ADMIN', 'CRIADOR'), controller.delete);
