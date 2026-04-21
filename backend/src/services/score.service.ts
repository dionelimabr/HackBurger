import { ScoreModel } from '../models/Score.model';
import { createError } from '../middlewares/errorHandler.middleware';

// Catalog of available challenges with their point values.
// Adding/removing entries is safe — unknown keys are rejected.
const CHALLENGE_CATALOG: Record<string, number> = {
  'visit-developer-page': 10,
  'open-leaderboard': 5,
  'first-purchase': 25,
  'owasp-sqli-login': 50,
  'owasp-xss-comment': 40,
  'owasp-idor-order': 60,
  'owasp-weak-crypto': 30,
  'owasp-open-redirect': 20,
  'owasp-csrf-profile': 45,
  'owasp-broken-auth': 55,
  'find-hidden-endpoint': 35,
  'inspect-api-docs': 15,
};

export const ScoreService = {
  async complete(userId: number, challengeKey: string) {
    const points = CHALLENGE_CATALOG[challengeKey];
    if (points == null) {
      throw createError('Desafio desconhecido', 400);
    }
    return ScoreModel.complete(userId, challengeKey, points);
  },

  async leaderboard(limit = 20) {
    return ScoreModel.leaderboard(Math.min(Math.max(limit, 1), 100));
  },

  async myStats(userId: number) {
    const stats = ScoreModel.getStats(userId);
    const completions = ScoreModel.getCompletions(userId);
    return {
      points: stats.points,
      challengesCompleted: stats.challenges_completed,
      completions: completions.map((c) => ({
        key: c.challenge_key,
        points: c.points,
        completedAt: c.completed_at,
      })),
      totalChallenges: Object.keys(CHALLENGE_CATALOG).length,
    };
  },

  catalog() {
    return Object.entries(CHALLENGE_CATALOG).map(([key, points]) => ({ key, points }));
  },
};
