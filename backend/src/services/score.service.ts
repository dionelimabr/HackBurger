import { ScoreModel } from '../models/Score.model';
import { createError } from '../middlewares/errorHandler.middleware';

// Catalog of available challenges with their point values.
// Adding/removing entries is safe — unknown keys are rejected.
const CHALLENGE_CATALOG: Record<string, number> = {
  // 1-star (Juice Shop inspired)
  'scoreBoardChallenge':            10,
  'privacyPolicyChallenge':         10,
  'errorHandlingChallenge':         10,
  'exposedMetricsChallenge':        10,
  'domXssChallenge':                10,
  'confidentialDocumentChallenge':  10,
  'zeroStarsChallenge':             10,
  'repetitiveRegistrationChallenge':10,
  'missingEncodingChallenge':       10,
  'outdatedAllowlistChallenge':     10,

  // 2-star
  'adminSectionChallenge':          20,
  'loginAdminChallenge':            20,
  'emptyUserRegistrationChallenge': 20,
  'fiveStarFeedbackChallenge':      20,
  'viewBasketChallenge':            20,
  'weirdCryptoChallenge':           20,
  'whiteHatChallenge':              20,

  // Exploration / meta
  'visit-developer-page': 10,
  'first-purchase': 25,
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
