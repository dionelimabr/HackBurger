import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess, sendCreated } from '../utils/response.util';

export const AuthController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      sendCreated(res, result, 'Conta criada com sucesso');
    } catch (err) { next(err); }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      sendSuccess(res, result, 'Login realizado com sucesso');
    } catch (err) { next(err); }
  },

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      await AuthService.changePassword(userId, req.body.oldPassword, req.body.newPassword);
      sendSuccess(res, null, 'Senha alterada com sucesso');
    } catch (err) { next(err); }
  },

  me(req: Request, res: Response) {
    sendSuccess(res, (req as any).user);
  },
};
