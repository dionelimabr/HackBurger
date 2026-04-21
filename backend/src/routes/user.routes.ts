import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { avatarUpload } from '../middlewares/upload.middleware';
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
      avatar_url: Joi.string().optional().allow(null, ''),
    }),
  }),
  UserController.updateProfile
);

router.post('/avatar', avatarUpload.single('avatar'), UserController.uploadAvatar);

export default router;
