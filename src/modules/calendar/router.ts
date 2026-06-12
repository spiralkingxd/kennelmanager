import { Router } from 'express';
import { CalendarController } from './controller';
import { requireRole } from '../../shared/middlewares/auth';

export const calendarRouter = Router();
const controller = new CalendarController();

/**
 * @swagger
 * /api/v1/calendar:
 *   get:
 *     summary: Lista todos os registros de calendar
 *     tags: [Calendar]
 *     responses: { 200: { description: 'Sucesso' } }
 *   post:
 *     summary: Cria um novo registro
 *     tags: [Calendar]
 *     responses: { 201: { description: 'Criado' } }
 * /api/v1/calendar/{id}:
 *   get:
 *     summary: Retorna um registro pelo ID
 *     tags: [Calendar]
 *     responses: { 200: { description: 'Sucesso' } }
 *   put:
 *     summary: Atualiza um registro
 *     tags: [Calendar]
 *     responses: { 200: { description: 'Atualizado' } }
 *   delete:
 *     summary: Exclui um registro
 *     tags: [Calendar]
 *     responses: { 200: { description: 'Excluído' } }
 */
calendarRouter.get('/', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), controller.getAll);
calendarRouter.post('/', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), controller.create);
calendarRouter.get('/:id', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), controller.getById);
calendarRouter.put('/:id', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), controller.update);
calendarRouter.delete('/:id', requireRole('ADMIN', 'CRIADOR'), controller.delete);
