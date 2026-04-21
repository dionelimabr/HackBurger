import { Router, Request, Response } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { authLimiter } from '../middlewares/rateLimiter.middleware';
import { UserModel } from '../models/User.model';
import { awardChallenge } from '../utils/challenge.util';
import Joi from 'joi';

const router = Router();

// Tracks repeated registration attempts per email (in-memory, resets on restart).
const registrationAttempts = new Map<string, number>();

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
  (req: Request, _res: Response, next) => {
    // CTF: Repetitive Registration — track duplicate-email attempts.
    const email = String(req.body?.email || '').toLowerCase();
    if (email) {
      const count = (registrationAttempts.get(email) ?? 0) + 1;
      registrationAttempts.set(email, count);
      if (count >= 2) {
        // Award the already-registered account owner, if any.
        const existing = UserModel.findByEmail(email) as { id: number } | undefined;
        if (existing) {
          (req as any).user = { userId: existing.id };
          awardChallenge(req, 'repetitiveRegistrationChallenge');
        }
      }
    }
    next();
  },
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
