import { Response, NextFunction } from 'express';
import { CartService } from '../services/cart.service';
import { sendSuccess } from '../utils/response.util';
import { AuthRequest } from '../middlewares/auth.middleware';
import { awardChallenge } from '../utils/challenge.util';

export const CartController = {
  async getCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // CTF: view_basket — when a ?userId= override is passed, the backend
      // blindly trusts it instead of req.user.userId. IDOR happens here.
      const overrideUserId = req.query.userId ? Number(req.query.userId) : null;
      const effectiveUserId = overrideUserId ?? req.user!.userId;

      if (overrideUserId && overrideUserId !== req.user!.userId) {
        awardChallenge(req, 'viewBasketChallenge');
      }

      const data = await CartService.getCart(effectiveUserId);
      sendSuccess(res, data);
    } catch (err) { next(err); }
  },

  async addItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // CTF: manipulate_basket — accepts userId override to add items to another user's cart
      const targetUserId = req.body.userId ? Number(req.body.userId) : req.user!.userId;
      if (req.body.userId && Number(req.body.userId) !== req.user!.userId) {
        awardChallenge(req, 'manipulateBasketChallenge');
      }
      const data = await CartService.addItem(targetUserId, req.body.productId, req.body.quantity ?? 1);
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
