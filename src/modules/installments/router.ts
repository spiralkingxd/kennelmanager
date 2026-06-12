import { Router } from 'express';
import { InstallmentController } from './controller';
import { requireRole } from '../../shared/middlewares/auth';

export const installmentsRouter = Router();
const controller = new InstallmentController();

/**
 * @swagger
 * /api/v1/installments:
 *   get:
 *     summary: Lista todas as parcelas
 *     tags: [Installments]
 *     responses: { 200: { description: 'Sucesso' } }
 *   post:
 *     summary: Cria uma nova parcela
 *     tags: [Installments]
 *     responses: { 201: { description: 'Criado' } }
 * /api/v1/installments/{id}:
 *   get:
 *     summary: Retorna uma parcela pelo ID
 *     tags: [Installments]
 *     responses: { 200: { description: 'Sucesso' } }
 *   put:
 *     summary: Atualiza uma parcela
 *     tags: [Installments]
 *     responses: { 200: { description: 'Atualizado' } }
 *   delete:
 *     summary: Exclui uma parcela
 *     tags: [Installments]
 *     responses: { 200: { description: 'Excluído' } }
 */
installmentsRouter.get('/', requireRole('ADMIN', 'CRIADOR', 'FINANCIAL'), controller.getAll);
installmentsRouter.post('/', requireRole('ADMIN', 'CRIADOR', 'FINANCIAL'), controller.create);
installmentsRouter.get('/:id', requireRole('ADMIN', 'CRIADOR', 'FINANCIAL'), controller.getById);
installmentsRouter.put('/:id', requireRole('ADMIN', 'CRIADOR', 'FINANCIAL'), controller.update);
installmentsRouter.delete('/:id', requireRole('ADMIN', 'CRIADOR'), controller.delete);
