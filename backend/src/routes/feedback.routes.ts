import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { validate } from '../middlewares/validate.middleware';
import { awardChallenge, softUserId } from '../utils/challenge.util';

const router = Router();

// In-memory store is enough for the CTF — resets on restart.
interface Feedback { id: number; author: string; rating: number; comment: string; createdAt: string; }
const feedbacks: Feedback[] = [];
let nextId = 1;

router.get('/', (_req: Request, res: Response) => {
  res.json({ status: 'success', data: feedbacks });
});

// CTF: five_star_feedback — deleting feedback is intentionally unauthenticated
// so any player can purge the only 5-star feedback from the catalog.
router.delete('/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const idx = feedbacks.findIndex((f) => f.id === id);
  if (idx < 0) {
    res.status(404).json({ status: 'error', message: 'Feedback não encontrado' });
    return;
  }
  const [removed] = feedbacks.splice(idx, 1);
  if (removed.rating === 5) awardChallenge(req, 'fiveStarFeedbackChallenge');
  res.json({ status: 'success', data: { id } });
});

// Seed a 5-star feedback so the challenge is solvable from a fresh boot.
if (!feedbacks.some((f) => f.rating === 5)) {
  feedbacks.push({
    id: nextId++,
    author: 'Admin',
    rating: 5,
    comment: 'Tudo perfeito, equipe nota 10!',
    createdAt: new Date().toISOString(),
  });
}

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

    // CTF: forged_feedback — userId in body differs from actual authenticated user
    const callerId = softUserId(req);
    const bodyUserId = req.body.userId ?? req.body.user_id;
    if (callerId && bodyUserId && Number(bodyUserId) !== callerId) {
      awardChallenge(req, 'forgedFeedbackChallenge');
    }

    // CTF: bonus_payload — complex XSS payload (iframe with src)
    if (/<iframe\s+.*src=/i.test(comment)) {
      awardChallenge(req, 'bonusPayloadChallenge');
    }

    res.status(201).json({ status: 'success', data: fb });
  },
);

export default router;
