import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { sendForbidden } from '../utils/response.util';

export function requireRole(...roles: ('admin' | 'customer')[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendForbidden(res, 'Usuário não autenticado');
      return;
    }
    if (!roles.includes(req.user.role)) {
      sendForbidden(res, 'Permissão insuficiente');
      return;
    }
    next();
  };
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  return requireRole('admin')(req, res, next);
}
