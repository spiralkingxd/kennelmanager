// src/modules/notifications/router.ts
// Endpoints REST para o módulo de notificações. Apenas ADMIN pode criar
// (uso interno do sistema). Usuários ADMIN/CRIADOR podem listar, ler e
// marcar como lidas as próprias notificações.
import { Router } from 'express';
import { requireRole } from '../../shared/middlewares/auth';
import { NotificationController } from './controller';

export const notificationsRouter = Router();
const controller = new NotificationController();

/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     summary: Lista notificações do usuário (ou todas, para ADMIN)
 *     tags: [Notifications]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [HEALTH_ALERT, REPRODUCTION_ALERT, FINANCIAL_ALERT, SALES_ALERT, WAITLIST_MATCH, SYSTEM] }
 *       - in: query
 *         name: unreadOnly
 *         schema: { type: boolean }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses: { 200: { description: 'Sucesso' } }
 *   post:
 *     summary: Cria uma notificação para um usuário (apenas ADMIN / sistema)
 *     tags: [Notifications]
 *     responses: { 201: { description: 'Criada' } }
 * /api/v1/notifications/{id}:
 *   get: { tags: [Notifications], summary: 'Busca notificação por ID', responses: { 200: { description: 'Sucesso' } } }
 *   delete: { tags: [Notifications], summary: 'Exclui notificação', responses: { 200: { description: 'Excluída' } } }
 * /api/v1/notifications/{id}/read:
 *   patch: { tags: [Notifications], summary: 'Marca notificação como lida', responses: { 200: { description: 'Sucesso' } } }
 * /api/v1/notifications/read-all:
 *   patch: { tags: [Notifications], summary: 'Marca todas as notificações do usuário como lidas', responses: { 200: { description: 'Sucesso' } } }
 */
notificationsRouter.get('/', requireRole('ADMIN', 'CRIADOR'), controller.getAll);
notificationsRouter.get('/:id', requireRole('ADMIN', 'CRIADOR'), controller.getById);
notificationsRouter.post('/', requireRole('ADMIN'), controller.create);
// Rotas com paths específicos vêm antes de :id
notificationsRouter.patch('/read-all', requireRole('ADMIN', 'CRIADOR'), controller.markAllAsRead);
notificationsRouter.patch('/:id/read', requireRole('ADMIN', 'CRIADOR'), controller.markAsRead);
notificationsRouter.delete('/:id', requireRole('ADMIN', 'CRIADOR'), controller.delete);
