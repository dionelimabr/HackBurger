import { Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { sendSuccess } from '../utils/response.util';
import { AuthRequest } from '../middlewares/auth.middleware';

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
};
