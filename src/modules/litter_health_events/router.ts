// src/modules/litter_health_events/router.ts
import { Router } from 'express';
import { requireRole } from '../../shared/middlewares/auth';
import { LitterHealthEventsController } from './controller';

const router = Router();
const controller = new LitterHealthEventsController();

// Rotas com query param vêm antes de :id
router.get('/', requireRole('ADMIN', 'CRIADOR', 'VET'), controller.getAll);
router.get('/:id', requireRole('ADMIN', 'CRIADOR', 'VET'), controller.getById);
router.post('/', requireRole('ADMIN', 'CRIADOR', 'VET'), controller.create);
router.put('/:id', requireRole('ADMIN', 'CRIADOR', 'VET'), controller.update);
router.delete('/:id', requireRole('ADMIN', 'CRIADOR'), controller.delete);

export default router;
