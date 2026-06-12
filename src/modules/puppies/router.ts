import { Router } from 'express';
import { PuppiesController } from './controller';
import { requireRole } from '../../shared/middlewares/auth';
import { entityDestructionLimiter } from '../../config/rateLimiters';

export const puppiesRouter = Router();
const controller = new PuppiesController();

/**
 * @swagger
 * /api/v1/puppies:
 *   get:
 *     summary: Lista todos os registros de puppies
 *     tags: [Puppies]
 *     responses: { 200: { description: 'Sucesso' } }
 *   post:
 *     summary: Cria um novo registro
 *     tags: [Puppies]
 *     responses: { 201: { description: 'Criado' } }
 * /api/v1/puppies/{id}:
 *   get:
 *     summary: Retorna um registro pelo ID
 *     tags: [Puppies]
 *     responses: { 200: { description: 'Sucesso' } }
 *   put:
 *     summary: Atualiza um registro
 *     tags: [Puppies]
 *     responses: { 200: { description: 'Atualizado' } }
 *   delete:
 *     summary: Exclui um registro
 *     tags: [Puppies]
 *     responses: { 200: { description: 'Excluído' } }
 */
puppiesRouter.get('/', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), controller.getAll);
puppiesRouter.post('/', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), controller.create);
puppiesRouter.get('/:id', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), controller.getById);
puppiesRouter.put('/:id', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), controller.update);
puppiesRouter.delete('/:id', entityDestructionLimiter, requireRole('ADMIN', 'CRIADOR'), controller.delete);
