import { Router } from 'express';
import { ClientsController } from './controller';
import { requireRole } from '../../shared/middlewares/auth';
import { clientDestructionLimiter } from '../../config/rateLimiters';

export const clientsRouter = Router();
const controller = new ClientsController();

/**
 * @swagger
 * /api/v1/clients:
 *   get:
 *     summary: Lista todos os registros de clients
 *     tags: [Clients]
 *     responses: { 200: { description: 'Sucesso' } }
 *   post:
 *     summary: Cria um novo registro
 *     tags: [Clients]
 *     responses: { 201: { description: 'Criado' } }
 * /api/v1/clients/{id}:
 *   get:
 *     summary: Retorna um registro pelo ID
 *     tags: [Clients]
 *     responses: { 200: { description: 'Sucesso' } }
 *   put:
 *     summary: Atualiza um registro
 *     tags: [Clients]
 *     responses: { 200: { description: 'Atualizado' } }
 *   delete:
 *     summary: Exclui um registro
 *     tags: [Clients]
 *     responses: { 200: { description: 'Excluído' } }
 */
clientsRouter.get('/', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), controller.getAll);
clientsRouter.get('/search', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), controller.search);
clientsRouter.post('/', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), controller.create);
clientsRouter.post('/bulk-impact', requireRole('ADMIN', 'CRIADOR'), controller.bulkImpact);
clientsRouter.delete('/bulk', clientDestructionLimiter, requireRole('ADMIN', 'CRIADOR'), controller.bulkDelete);
clientsRouter.get('/:id/impact', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), controller.getImpact);
clientsRouter.get('/:id', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), controller.getById);
clientsRouter.put('/:id', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), controller.update);
clientsRouter.delete('/:id', clientDestructionLimiter, requireRole('ADMIN', 'CRIADOR'), controller.delete);
