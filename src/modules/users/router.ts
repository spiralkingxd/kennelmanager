import { Router } from 'express';
import { UsersController } from './controller';
import { requireRole } from '../../shared/middlewares/auth';
import { isolationUserId } from '../../shared/utils/adminHelpers';
import { UsersService } from './service';
import { userDestructionLimiter, userPasswordResetLimiter } from '../../config/rateLimiters';

export const usersRouter = Router();
const controller = new UsersController();
const service = new UsersService();

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Lista todos os registros de users
 *     tags: [Users]
 *     responses: { 200: { description: 'Sucesso' } }
 *   post:
 *     summary: Cria um novo registro
 *     tags: [Users]
 *     responses: { 201: { description: 'Criado' } }
 * /api/v1/users/{id}:
 *   get:
 *     summary: Retorna um registro pelo ID
 *     tags: [Users]
 *     responses: { 200: { description: 'Sucesso' } }
 *   put:
 *     summary: Atualiza um registro
 *     tags: [Users]
 *     responses: { 200: { description: 'Atualizado' } }
 *   delete:
 *     summary: Exclui um registro
 *     tags: [Users]
 *     responses: { 200: { description: 'Excluído' } }
 * /api/v1/users/{id}/reset-password:
 *   post:
 *     summary: Gera uma nova senha temporária e a retorna em texto plano (apenas ADMIN)
 *     tags: [Users]
 *     responses: { 200: { description: 'Senha redefinida' } }
 */
usersRouter.get('/', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), controller.getAll);
usersRouter.get('/:id', requireRole('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL'), controller.getById);
usersRouter.post('/', requireRole('ADMIN'), controller.create);
usersRouter.put('/:id', requireRole('ADMIN'), controller.update);
usersRouter.delete('/:id', userDestructionLimiter, requireRole('ADMIN'), controller.delete);
usersRouter.post('/:id/reset-password', userPasswordResetLimiter, requireRole('ADMIN'), async (req, res, next) => {
  try {
    await service.resetPassword(req.params.id, isolationUserId(req));
    return res.status(200).json({ success: true, message: 'Senha redefinida com sucesso.' });
  } catch (error) { next(error); }
});
