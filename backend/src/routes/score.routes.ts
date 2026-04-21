import { Router } from 'express';
import Joi from 'joi';
import { ScoreController } from '../controllers/score.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

// Public: leaderboard and challenge catalog
router.get('/leaderboard', ScoreController.leaderboard);
router.get('/catalog',     ScoreController.catalog);

// Authenticated: complete challenge + my stats
router.get('/me', authenticate, ScoreController.me);

router.post(
  '/complete',
  authenticate,
  validate({ body: Joi.object({ challengeKey: Joi.string().min(2).max(64).required() }) }),
  ScoreController.complete,
);

export default router;
