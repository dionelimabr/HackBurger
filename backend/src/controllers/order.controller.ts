import { Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { sendSuccess, sendCreated } from '../utils/response.util';
import { AuthRequest } from '../middlewares/auth.middleware';

export const OrderController = {
  async getMyOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const orders = await OrderService.getUserOrders(req.user!.userId);
      sendSuccess(res, orders);
    } catch (err) { next(err); }
  },

  async getOrderById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await OrderService.getOrderById(Number(req.params.id), req.user!.userId);
      sendSuccess(res, order);
    } catch (err) { next(err); }
  },

  async checkout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await OrderService.checkout({ ...req.body, userId: req.user!.userId });
      sendCreated(res, order, 'Pedido criado com sucesso');
    } catch (err) { next(err); }
  },

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await OrderService.updateStatus(Number(req.params.id), req.body.status);
      sendSuccess(res, order, 'Status atualizado');
    } catch (err) { next(err); }
  },
};
