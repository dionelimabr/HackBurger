import { Response, NextFunction } from 'express';
import { ScoreService } from '../services/score.service';
import { sendSuccess } from '../utils/response.util';
import { AuthRequest } from '../middlewares/auth.middleware';

export const ScoreController = {
  async leaderboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = Number(req.query.limit) || 20;
      const data = await ScoreService.leaderboard(limit);
      sendSuccess(res, data);
    } catch (err) { next(err); }
  },

  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await ScoreService.myStats(req.user!.userId);
      sendSuccess(res, data);
    } catch (err) { next(err); }
  },

  async complete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { challengeKey } = req.body;
      const data = await ScoreService.complete(req.user!.userId, challengeKey);
      sendSuccess(res, data, data.alreadyCompleted ? 'Desafio já completado' : 'Desafio concluído!');
    } catch (err) { next(err); }
  },

  async catalog(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      sendSuccess(res, ScoreService.catalog());
    } catch (err) { next(err); }
  },
};
