import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { awardChallenge } from '../utils/challenge.util';
import { UserModel } from '../models/User.model';

const router = Router();

/**
 * Miscellaneous CTF endpoints (2-star).
 */

// CTF: white_hat — security contact disclosure (security.txt pattern).
const SECURITY_TXT = `Contact: security@hackburger.com
Expires: 2099-12-31T23:59:59.000Z
Preferred-Languages: pt, en
Canonical: https://hackburger.com/.well-known/security.txt
Policy: https://hackburger.com/policy
Acknowledgments: https://hackburger.com/hall-of-fame

# If you found this, you are already part of the white-hat team.
`;

router.get('/security.txt', (req: Request, res: Response) => {
  awardChallenge(req, 'whiteHatChallenge');
  res.type('text/plain').send(SECURITY_TXT);
});

// CTF: weird_crypto — a "password reset token" endpoint that returns an MD5
// hash of the user's email — weak and deterministic.
router.get('/crypto/token/:userId', (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  const user = UserModel.findById(userId) as { email: string } | undefined;
  if (!user) {
    res.status(404).json({ status: 'error', message: 'Usuário não encontrado' });
    return;
  }

  // MD5 is broken / weird; a real reset token must be random and HMAC'd.
  const token = crypto.createHash('md5').update(user.email).digest('hex');

  awardChallenge(req, 'weirdCryptoChallenge');
  res.json({ status: 'success', data: { token, algorithm: 'md5' } });
});

// CTF: admin_section — just discovering the backend admin endpoints awards
// the challenge (real authorisation still enforced elsewhere).
router.get('/administration', (req: Request, res: Response) => {
  awardChallenge(req, 'adminSectionChallenge');
  res.json({
    status: 'success',
    data: {
      hint: 'You found the hidden admin section. Real admin UI lives under /admin in the SPA.',
    },
  });
});

export default router;
