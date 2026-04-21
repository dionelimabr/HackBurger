import { Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { sendSuccess } from '../utils/response.util';
import { AuthRequest } from '../middlewares/auth.middleware';
import { createError } from '../middlewares/errorHandler.middleware';

export const UserController = {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await UserService.getProfile(req.user!.userId);
      sendSuccess(res, user);
    } catch (err) { next(err); }
  },

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await UserService.updateProfile(req.user!.userId, req.body);
      sendSuccess(res, user, 'Perfil atualizado');
    } catch (err) { next(err); }
  },

  async uploadAvatar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw createError('Arquivo não enviado', 400);
      const relativePath = `/uploads/avatars/${req.file.filename}`;
      const user = await UserService.updateProfile(req.user!.userId, { avatar_url: relativePath });
      sendSuccess(res, user, 'Avatar atualizado');
    } catch (err) { next(err); }
  },
};
