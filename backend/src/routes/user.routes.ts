import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import Joi from 'joi';

const router = Router();

router.use(authenticate);

router.get('/profile', UserController.getProfile);

router.put(
  '/profile',
  validate({
    body: Joi.object({
      name: Joi.string().optional(),
      phone: Joi.string().optional().allow(null),
      avatar_url: Joi.string().uri().optional().allow(null),
    }),
  }),
  UserController.updateProfile
);

export default router;
