import { Router } from 'express';
import { LittersController } from './controller';
import { requireRole } from '../../shared/middlewares/auth';
import { entityDestructionLimiter } from '../../config/rateLimiters';

export const littersRouter = Router();
const controller = new LittersController();

/**
 * @swagger
 * /api/v1/litters:
 *   get:
 *     summary: Lista todos os registros de litters
 *     tags: [Litters]
 *     responses: { 200: { description: 'Sucesso' } }
 *   post:
 *     summary: Cria um novo registro
 *     tags: [Litters]
 *     responses: { 201: { description: 'Criado' } }
 * /api/v1/litters/{id}:
 *   get:
 *     summary: Retorna um registro pelo ID
 *     tags: [Litters]
 *     responses: { 200: { description: 'Sucesso' } }
 *   put:
 *     summary: Atualiza um registro
 *     tags: [Litters]
 *     responses: { 200: { description: 'Atualizado' } }
 *   delete:
 *     summary: Exclui um registro
 *     tags: [Litters]
 *     responses: { 200: { description: 'Excluído' } }
 */
littersRouter.get('/', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), controller.getAll);
littersRouter.post('/', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), controller.create);
littersRouter.get('/:id', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), controller.getById);
littersRouter.put('/:id', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), controller.update);
littersRouter.delete('/:id', entityDestructionLimiter, requireRole('ADMIN', 'CRIADOR'), controller.delete);
