import { Router } from 'express';
import { FinancialController } from './controller';
import { requireRole } from '../../shared/middlewares/auth';
import { financialLimiter } from '../../config/rateLimiters';

export const financialRouter = Router();
const controller = new FinancialController();

/**
 * @swagger
 * /api/v1/financial:
 *   get:
 *     summary: Lista todos os registros de financial
 *     tags: [Financial]
 *     responses: { 200: { description: 'Sucesso' } }
 *   post:
 *     summary: Cria um novo registro
 *     tags: [Financial]
 *     responses: { 201: { description: 'Criado' } }
 * /api/v1/financial/{id}:
 *   get:
 *     summary: Retorna um registro pelo ID
 *     tags: [Financial]
 *     responses: { 200: { description: 'Sucesso' } }
 *   put:
 *     summary: Atualiza um registro
 *     tags: [Financial]
 *     responses: { 200: { description: 'Atualizado' } }
 *   delete:
 *     summary: Exclui um registro
 *     tags: [Financial]
 *     responses: { 200: { description: 'Excluído' } }
 */
financialRouter.get('/', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), controller.getAll);
financialRouter.post('/', financialLimiter, requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), controller.create);
financialRouter.get('/:id', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), controller.getById);
financialRouter.put('/:id', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), controller.update);
financialRouter.delete('/:id', financialLimiter, requireRole('ADMIN', 'CRIADOR'), controller.delete);
