import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ScoreModel } from '../models/Score.model';
import { AuthRequest } from '../middlewares/auth.middleware';

interface JwtPayload { userId: number; [key: string]: any; }

/**
 * Best-effort: extracts a user id from the Authorization header without throwing.
 * Allows scoring CTF challenges on endpoints that are intentionally unauthenticated
 * (e.g. /metrics, /privacy) but only award points when a valid token is present.
 */
export function softUserId(req: Request): number | null {
  const authed = (req as AuthRequest).user;
  if (authed?.userId) return authed.userId;

  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;

  try {
    const decoded = jwt.verify(header.split(' ')[1], env.JWT_SECRET) as JwtPayload;
    return decoded.userId ?? null;
  } catch {
    return null;
  }
}

const CHALLENGE_POINTS: Record<string, number> = {
  // 1-star
  scoreBoardChallenge: 10,
  privacyPolicyChallenge: 10,
  errorHandlingChallenge: 10,
  exposedMetricsChallenge: 10,
  domXssChallenge: 10,
  confidentialDocumentChallenge: 10,
  zeroStarsChallenge: 10,
  repetitiveRegistrationChallenge: 10,
  missingEncodingChallenge: 10,
  outdatedAllowlistChallenge: 10,
  // 2-star
  adminSectionChallenge: 20,
  loginAdminChallenge: 20,
  emptyUserRegistrationChallenge: 20,
  fiveStarFeedbackChallenge: 20,
  viewBasketChallenge: 20,
  weirdCryptoChallenge: 20,
  whiteHatChallenge: 20,
  // meta
  'visit-developer-page': 10,
  'first-purchase': 25,
};

/**
 * Idempotently award a challenge to a user when an exploit is detected.
 * Silently no-ops if the challenge key is unknown or the user is not authenticated.
 */
export function awardChallenge(req: Request, challengeKey: string): void {
  const userId = softUserId(req);
  const points = CHALLENGE_POINTS[challengeKey];
  if (!userId || points == null) return;

  try {
    ScoreModel.complete(userId, challengeKey, points);
  } catch {
    /* Best effort — never block the original request on scoring errors. */
  }
}
