import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { validate } from '../middlewares/validate.middleware';
import { awardChallenge } from '../utils/challenge.util';

const router = Router();

// In-memory store is enough for the CTF — resets on restart.
interface Feedback { id: number; author: string; rating: number; comment: string; createdAt: string; }
const feedbacks: Feedback[] = [];
let nextId = 1;

router.get('/', (_req: Request, res: Response) => {
  res.json({ status: 'success', data: feedbacks });
});

router.post(
  '/',
  validate({
    body: Joi.object({
      author:  Joi.string().max(80).required(),
      // Front-end restricts ratings to 1-5, but the API accepts 0 on purpose.
      rating:  Joi.number().integer().min(0).max(5).required(),
      comment: Joi.string().max(500).required(),
    }),
  }),
  (req: Request, res: Response) => {
    const { author, rating, comment } = req.body;

    const fb: Feedback = {
      id: nextId++,
      author,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };
    feedbacks.push(fb);

    // CTF: Zero Stars — backend accepts ratings below the UI's minimum.
    if (rating === 0) awardChallenge(req, 'zeroStarsChallenge');

    res.status(201).json({ status: 'success', data: fb });
  },
);

export default router;
