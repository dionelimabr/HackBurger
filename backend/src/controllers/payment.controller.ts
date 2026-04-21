import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service';
import { sendSuccess, sendCreated } from '../utils/response.util';
import { AuthRequest } from '../middlewares/auth.middleware';

export const PaymentController = {
  async processPayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const payment = await PaymentService.processPayment(req.body);
      sendCreated(res, payment, 'Pagamento processado');
    } catch (err) { next(err); }
  },

  async getPaymentByOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await PaymentService.getPaymentByOrder(Number(req.params.orderId));
      sendSuccess(res, payment);
    } catch (err) { next(err); }
  },

  async refund(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await PaymentService.refund(Number(req.params.id));
      sendSuccess(res, payment, 'Reembolso processado');
    } catch (err) { next(err); }
  },
};
