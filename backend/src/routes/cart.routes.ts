import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import Joi from 'joi';

const router = Router();

router.use(authenticate);

router.get('/', CartController.getCart);

router.post(
  '/items',
  validate({
    body: Joi.object({
      productId: Joi.number().required(),
      quantity: Joi.number().min(1).default(1),
    }),
  }),
  CartController.addItem
);

router.put(
  '/items/:itemId',
  validate({
    params: Joi.object({ itemId: Joi.number().required() }),
    body: Joi.object({ quantity: Joi.number().min(0).required() }),
  }),
  CartController.updateItem
);

router.delete('/items/:itemId', CartController.removeItem);
router.delete('/', CartController.clearCart);

export default router;
