import { Router } from 'express';
import { AnimalsController } from './controller';
import { requireRole } from '../../shared/middlewares/auth';
import { entityDestructionLimiter } from '../../config/rateLimiters';

export const animalsRouter = Router();
const controller = new AnimalsController();

/**
 * @swagger
 * /api/v1/animals:
 *   get:
 *     summary: Lista todos os registros de animals
 *     tags: [Animals]
 *     responses: { 200: { description: 'Sucesso' } }
 *   post:
 *     summary: Cria um novo registro
 *     tags: [Animals]
 *     responses: { 201: { description: 'Criado' } }
 * /api/v1/animals/{id}:
 *   get:
 *     summary: Retorna um registro pelo ID
 *     tags: [Animals]
 *     responses: { 200: { description: 'Sucesso' } }
 *   put:
 *     summary: Atualiza um registro
 *     tags: [Animals]
 *     responses: { 200: { description: 'Atualizado' } }
 *   delete:
 *     summary: Exclui um registro
 *     tags: [Animals]
 *     responses: { 200: { description: 'Excluído' } }
 */
animalsRouter.get('/', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), controller.getAll);
animalsRouter.post('/', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), controller.create);
animalsRouter.get('/:id/impact', requireRole('ADMIN', 'CRIADOR'), controller.getImpact);
animalsRouter.get('/:id', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), controller.getById);
animalsRouter.put('/:id', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), controller.update);
animalsRouter.delete('/:id', entityDestructionLimiter, requireRole('ADMIN', 'CRIADOR'), controller.delete);
