import { Request, Response, NextFunction } from 'express';
import { CartService } from '../services/cart.service';
import { sendSuccess } from '../utils/response.util';
import { AuthRequest } from '../middlewares/auth.middleware';

export const CartController = {
  async getCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await CartService.getCart(req.user!.userId);
      sendSuccess(res, data);
    } catch (err) { next(err); }
  },

  async addItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await CartService.addItem(req.user!.userId, req.body.productId, req.body.quantity ?? 1);
      sendSuccess(res, data, 'Item adicionado ao carrinho');
    } catch (err) { next(err); }
  },

  async updateItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await CartService.updateItem(req.user!.userId, Number(req.params.itemId), req.body.quantity);
      sendSuccess(res, data, 'Carrinho atualizado');
    } catch (err) { next(err); }
  },

  async removeItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await CartService.removeItem(req.user!.userId, Number(req.params.itemId));
      sendSuccess(res, data, 'Item removido');
    } catch (err) { next(err); }
  },

  async clearCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await CartService.clearCart(req.user!.userId);
      sendSuccess(res, null, 'Carrinho limpo');
    } catch (err) { next(err); }
  },
};
