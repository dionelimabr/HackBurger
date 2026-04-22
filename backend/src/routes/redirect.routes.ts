import { Router, Request, Response } from 'express';
import { awardChallenge } from '../utils/challenge.util';

const router = Router();

/**
 * Redirect allow-list is outdated — the string check can be bypassed
 * by crafting a URL that *contains* an allow-listed host as a substring
 * but points elsewhere (classic open-redirect pattern).
 */
const ALLOWED_HOST_FRAGMENTS = [
  'github.com/dionelimabr',
  'hackburger.com',
];

router.get('/', (req: Request, res: Response) => {
  const target = String(req.query.to ?? '');
  if (!target) {
    res.status(400).type('text/plain').send('Missing "to" query parameter.');
    return;
  }

  // Loose check — only verifies that an allow-listed fragment appears
  // anywhere in the URL. Easy to bypass with `?to=https://evil.tld/#github.com/dionelimabr`.
  const allowed = ALLOWED_HOST_FRAGMENTS.some((frag) => target.includes(frag));
  if (!allowed) {
    res.status(403).type('text/plain').send('Target not in allow-list.');
    return;
  }

  // If the effective host differs from any allow-listed host, the player
  // bypassed the allow-list. Award the challenge.
  try {
    const url = new URL(target);
    const hostMatches = ALLOWED_HOST_FRAGMENTS.some((frag) => frag.startsWith(url.host));
    if (!hostMatches) {
      awardChallenge(req, 'outdatedAllowlistChallenge');
      // 4-star allowlist bypass — more sophisticated patterns
      if (/@|%40|%23|\\\\/.test(target)) {
        awardChallenge(req, 'allowlistBypassChallenge');
      }
    }
  } catch {
    /* malformed URL — still redirect because the raw string contained a fragment */
  }

  res.redirect(target);
});

export default router;
