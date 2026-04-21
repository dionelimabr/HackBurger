import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import Joi from 'joi';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  validate({
    body: Joi.object({
      orderId: Joi.number().required(),
      method: Joi.string().valid('credit_card', 'debit_card', 'pix', 'cash').required(),
    }),
  }),
  PaymentController.processPayment
);

router.get('/order/:orderId', PaymentController.getPaymentByOrder);

export default router;
