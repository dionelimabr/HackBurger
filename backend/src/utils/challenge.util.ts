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
  // ── 1-star (10 pts) ──
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
  bonusPayloadChallenge: 10,
  bullyChatbotChallenge: 10,
  massDispelChallenge: 10,
  web3InterfaceChallenge: 10,

  // ── 2-star (20 pts) ──
  adminSectionChallenge: 20,
  loginAdminChallenge: 20,
  emptyUserRegistrationChallenge: 20,
  fiveStarFeedbackChallenge: 20,
  viewBasketChallenge: 20,
  weirdCryptoChallenge: 20,
  whiteHatChallenge: 20,
  deprecatedInterfaceChallenge: 20,
  loginMcSafeSearchChallenge: 20,
  metaGeostakingChallenge: 20,
  nftTakeoverChallenge: 20,
  passwordStrengthChallenge: 20,
  reflectedXssChallenge: 20,
  visualGeostakingChallenge: 20,

  // ── 3-star (30 pts) ──
  adminRegistrationChallenge: 30,
  bjoernFavoritePetChallenge: 30,
  captchaBypassChallenge: 30,
  csrfChallenge: 30,
  databaseSchemaChallenge: 30,
  deluxeFraudChallenge: 30,
  forgedFeedbackChallenge: 30,
  forgedReviewChallenge: 30,
  gdprDataErasureChallenge: 30,
  loginAmyChallenge: 30,
  loginBenderChallenge: 30,
  loginJimChallenge: 30,
  manipulateBasketChallenge: 30,
  mintTheHoneyPotChallenge: 30,
  paybackTimeChallenge: 30,
  privacyPolicyInspectionChallenge: 30,
  productTamperingChallenge: 30,
  resetJimPasswordChallenge: 30,
  uploadSizeChallenge: 30,

  // ── 4-star (40 pts) ──
  accessLogChallenge: 40,
  allowlistBypassChallenge: 40,
  christmasSpecialChallenge: 40,
  easterEggChallenge: 40,
  ephemeralAccountantChallenge: 40,
  expiredCouponChallenge: 40,
  forgottenSalesBackupChallenge: 40,
  gdprDataTheftChallenge: 40,
  leakedUnsafeProductChallenge: 40,
  legacyTyposquattingChallenge: 40,
  loginBjoernChallenge: 40,
  loginUvoginChallenge: 40,
  nestedEasterEggChallenge: 40,
  nosqlDosChallenge: 40,
  nosqlManipulationChallenge: 40,
  poisonNullBytesChallenge: 40,
  serverSideXssChallenge: 40,
  steganographyChallenge: 40,
  userCredentialsChallenge: 40,
  vulnerableLibraryChallenge: 40,
  xHeaderXssChallenge: 40,

  // ── 5-star (50 pts) ──
  blockchainHypeChallenge: 50,
  blockedRceDosChallenge: 50,
  changeBenderPasswordChallenge: 50,
  crossSiteImagingChallenge: 50,
  emailLeakChallenge: 50,
  extraLanguageChallenge: 50,
  frontendTyposquattingChallenge: 50,
  killChatbotChallenge: 50,
  leakedAccessLogChallenge: 50,
  localFileReadChallenge: 50,
  nosqlExfiltrationChallenge: 50,
  resetBjoernPasswordChallenge: 50,
  resetMortyPasswordChallenge: 50,
  retrieveBlueprintChallenge: 50,
  supplyChainAttackChallenge: 50,
  twoFactorAuthChallenge: 50,
  unsignedJwtChallenge: 50,

  // ── 6-star (60 pts) ──
  arbitraryFileWriteChallenge: 60,
  forgedCouponChallenge: 60,
  forgedSignedJwtChallenge: 60,
  imaginaryChallenge: 60,
  loginSupportTeamChallenge: 60,
  multiplesLikesChallenge: 60,
  premiumPaywallChallenge: 60,
  ssrfChallenge: 60,
  sstiChallenge: 60,
  successfulRceDosChallenge: 60,
  videoXssChallenge: 60,
  walletDepletionChallenge: 60,

  // ── Meta/exploration ──
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
