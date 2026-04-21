import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { checkoutLimiter } from '../middlewares/rateLimiter.middleware';
import Joi from 'joi';

const router = Router();

router.use(authenticate);

router.get('/', OrderController.getMyOrders);
router.get('/:id', OrderController.getOrderById);

router.post(
  '/checkout',
  checkoutLimiter,
  validate({
    body: Joi.object({
      address_street: Joi.string().required(),
      address_number: Joi.string().required(),
      address_city: Joi.string().required(),
      address_state: Joi.string().required(),
      address_zip: Joi.string().required(),
      notes: Joi.string().optional().allow(''),
    }),
  }),
  OrderController.checkout
);

export default router;
