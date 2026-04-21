import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { authLimiter } from '../middlewares/rateLimiter.middleware';
import Joi from 'joi';

const router = Router();

router.post(
  '/register',
  authLimiter,
  validate({
    body: Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      phone: Joi.string().optional(),
    }),
  }),
  AuthController.register
);

router.post(
  '/login',
  authLimiter,
  validate({
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  }),
  AuthController.login
);

router.post(
  '/change-password',
  authenticate,
  validate({
    body: Joi.object({
      oldPassword: Joi.string().required(),
      newPassword: Joi.string().min(6).required(),
    }),
  }),
  AuthController.changePassword
);

router.get('/me', authenticate, AuthController.me);

export default router;
