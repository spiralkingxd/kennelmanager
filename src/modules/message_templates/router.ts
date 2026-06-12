import { Router } from 'express';
import { MessageTemplateController } from './controller';
import { requireRole } from '../../shared/middlewares/auth';

export const messageTemplatesRouter = Router();
const controller = new MessageTemplateController();

/**
 * @swagger
 * /api/v1/message-templates:
 *   get:
 *     summary: Lista todos os modelos de mensagem
 *     tags: [MessageTemplates]
 *     responses: { 200: { description: 'Sucesso' } }
 *   post:
 *     summary: Cria um novo modelo de mensagem
 *     tags: [MessageTemplates]
 *     responses: { 201: { description: 'Criado' } }
 * /api/v1/message-templates/{id}:
 *   get:
 *     summary: Retorna um modelo de mensagem pelo ID
 *     tags: [MessageTemplates]
 *     responses: { 200: { description: 'Sucesso' } }
 *   put:
 *     summary: Atualiza um modelo de mensagem
 *     tags: [MessageTemplates]
 *     responses: { 200: { description: 'Atualizado' } }
 *   delete:
 *     summary: Exclui um modelo de mensagem
 *     tags: [MessageTemplates]
 *     responses: { 200: { description: 'Excluído' } }
 */
messageTemplatesRouter.get('/', requireRole('ADMIN', 'CRIADOR', 'COMMERCIAL'), controller.getAll);
messageTemplatesRouter.post('/', requireRole('ADMIN', 'CRIADOR', 'COMMERCIAL'), controller.create);
messageTemplatesRouter.get('/:id', requireRole('ADMIN', 'CRIADOR', 'COMMERCIAL'), controller.getById);
messageTemplatesRouter.put('/:id', requireRole('ADMIN', 'CRIADOR', 'COMMERCIAL'), controller.update);
messageTemplatesRouter.delete('/:id', requireRole('ADMIN', 'CRIADOR'), controller.delete);
