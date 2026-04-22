import { ScoreModel } from '../models/Score.model';
import { createError } from '../middlewares/errorHandler.middleware';

// Catalog of available challenges with their point values.
// Adding/removing entries is safe — unknown keys are rejected.
const CHALLENGE_CATALOG: Record<string, number> = {
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
