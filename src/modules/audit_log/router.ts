import { Router } from 'express';
import { AuditLogController } from './controller';
import { requireRole } from '../../shared/middlewares/auth';

export const auditLogRouter = Router();
const controller = new AuditLogController();

/**
 * @swagger
 * /api/v1/audit:
 *   get:
 *     summary: Lista todos os registros de auditoria
 *     tags: [Audit Log]
 *     responses: { 200: { description: 'Sucesso' } }
 *   post:
 *     summary: Cria um novo registro de auditoria
 *     tags: [Audit Log]
 *     responses: { 201: { description: 'Criado' } }
 * /api/v1/audit/{id}:
 *   get:
 *     summary: Retorna um registro de auditoria pelo ID
 *     tags: [Audit Log]
 *     responses: { 200: { description: 'Sucesso' } }
 */
auditLogRouter.get('/', requireRole('ADMIN', 'CRIADOR'), controller.getAll);
auditLogRouter.post('/', requireRole('ADMIN'), controller.create);
auditLogRouter.get('/:id', requireRole('ADMIN', 'CRIADOR'), controller.getById);
