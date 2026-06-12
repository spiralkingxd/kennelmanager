import { Router } from 'express';
import { SystemConfigController } from './controller';
import { requireRole } from '../../shared/middlewares/auth';

export const systemConfigRouter = Router();
const controller = new SystemConfigController();

/**
 * @swagger
 * /api/v1/system-config:
 *   get:
 *     summary: Lista todas as configurações do sistema
 *     tags: [System Config]
 *     responses: { 200: { description: 'Sucesso' } }
 * /api/v1/system-config/{key}:
 *   get:
 *     summary: Retorna uma configuração pela chave
 *     tags: [System Config]
 *     responses: { 200: { description: 'Sucesso' } }
 *   put:
 *     summary: Cria ou atualiza uma configuração
 *     tags: [System Config]
 *     responses: { 200: { description: 'Salvo' } }
 *   delete:
 *     summary: Exclui uma configuração
 *     tags: [System Config]
 *     responses: { 200: { description: 'Excluído' } }
 */
systemConfigRouter.get('/', requireRole('ADMIN'), controller.getAll);
systemConfigRouter.get('/:key', requireRole('ADMIN'), controller.getByKey);
systemConfigRouter.put('/:key', requireRole('ADMIN'), controller.upsert);
systemConfigRouter.delete('/:key', requireRole('ADMIN'), controller.delete);
