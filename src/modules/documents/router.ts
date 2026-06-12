import { Router } from 'express';
import { DocumentsController } from './controller';
import { requireRole } from '../../shared/middlewares/auth';

export const documentsRouter = Router();
const ctrl = new DocumentsController();

/**
 * @swagger
 * tags:
 *   name: Documents
 *   description: Documentos e anexos dos animais
 */
documentsRouter.get('/', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), ctrl.getAll);
documentsRouter.get('/animal/:animalId', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), ctrl.getByAnimal);
documentsRouter.get('/:id', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), ctrl.getById);
documentsRouter.post('/', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), ctrl.create);
documentsRouter.put('/:id', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), ctrl.update);
documentsRouter.delete('/:id', requireRole('ADMIN', 'CRIADOR'), ctrl.delete);
