import { Router, Request, Response } from 'express';
import { getDb } from '../config/database';
import { signToken } from '../utils/jwt.util';
import { awardChallenge, softUserId } from '../utils/challenge.util';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();

/**
 * Password reset via security questions — intentionally vulnerable.
 * Exposes: meta_geostaking, visual_geostaking, bjoern_favorite_pet,
 *          reset_jim_password, reset_bjoern_password, reset_morty_password
 */
router.get('/security-question/:email', (req: Request, res: Response) => {
  const user = getDb().prepare('SELECT u.id, sq.question FROM users u JOIN security_questions sq ON sq.user_id = u.id WHERE u.email = ?')
    .get(req.params.email) as { id: number; question: string } | undefined;
  if (!user) { res.status(404).json({ status: 'error', message: 'Usuário não encontrado' }); return; }
  res.json({ status: 'success', data: { question: user.question } });
});

router.post('/reset-password', (req: Request, res: Response) => {
  const { email, answer, newPassword } = req.body ?? {};
  const row = getDb().prepare(
    `SELECT u.id, u.email, u.role, sq.answer FROM users u
     JOIN security_questions sq ON sq.user_id = u.id WHERE u.email = ?`
  ).get(String(email)) as { id: number; email: string; role: string; answer: string } | undefined;

  if (!row) { res.status(404).json({ status: 'error', message: 'Usuário não encontrado' }); return; }

  // Case-insensitive comparison — intentionally weak
  if (String(answer).toLowerCase().trim() !== row.answer.toLowerCase().trim()) {
    res.status(403).json({ status: 'error', message: 'Resposta incorreta' }); return;
  }

  // Award challenges based on whose password was reset
  const fakeReq = { ...req, user: { userId: row.id } } as any;
  const challenges: Record<string, string[]> = {
    'lucas@hackburger.com':   ['resetJimPasswordChallenge'],
    'caio@hackburger.com':    ['resetBjoernPasswordChallenge', 'bjoernFavoritePetChallenge'],
    'gabriel@hackburger.com': ['resetMortyPasswordChallenge'],
    'felipe@hackburger.com':  ['metaGeostakingChallenge', 'visualGeostakingChallenge'],
  };
  const cks = challenges[row.email];
  if (cks) cks.forEach(c => awardChallenge(fakeReq, c));

  // Actually reset (insecure: stores plaintext for CTF, a real app would hash)
  const bcrypt = require('bcryptjs');
  const hashed = bcrypt.hashSync(String(newPassword), 12);
  getDb().prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, row.id);

  const token = signToken({ userId: row.id, email: row.email, role: row.role as 'admin' | 'customer' });
  res.json({ status: 'success', data: { token }, message: 'Senha alterada' });
});

// CTF: change_bender_password — change password via CSRF-like GET request (no old password needed)
router.get('/change-password', (req: Request, res: Response) => {
  const { new: newPwd, repeat } = req.query;
  if (!newPwd || newPwd !== repeat) {
    res.status(400).json({ status: 'error', message: 'Passwords do not match' }); return;
  }
  const userId = softUserId(req);
  if (!userId) { res.status(401).json({ status: 'error', message: 'Not authenticated' }); return; }

  const user = getDb().prepare('SELECT email FROM users WHERE id = ?').get(userId) as { email: string } | undefined;
  if (user?.email === 'roberto@hackburger.com') {
    awardChallenge(req, 'changeBenderPasswordChallenge');
  }

  const bcrypt = require('bcryptjs');
  getDb().prepare('UPDATE users SET password = ? WHERE id = ?').run(bcrypt.hashSync(String(newPwd), 12), userId);
  res.json({ status: 'success', message: 'Password changed' });
});

// CTF: admin_registration — register with role=admin in body (backend trusts client-provided role)
router.post('/register-admin', (req: Request, res: Response) => {
  const { name, email, password, role } = req.body ?? {};
  const bcrypt = require('bcryptjs');
  try {
    const hashed = bcrypt.hashSync(String(password || '123456'), 12);
    const effectiveRole = (role === 'admin') ? 'admin' : 'customer';
    const result = getDb().prepare(
      `INSERT INTO users (name, email, password, role, is_active) VALUES (?, ?, ?, ?, 1)`
    ).run(name || 'Anon', email || `anon-${Date.now()}@x.com`, hashed, effectiveRole);

    if (effectiveRole === 'admin') {
      (req as any).user = { userId: result.lastInsertRowid };
      awardChallenge(req, 'adminRegistrationChallenge');
    }
    const token = signToken({
      userId: result.lastInsertRowid as number,
      email: email || '',
      role: effectiveRole as 'admin' | 'customer',
    });
    res.status(201).json({ status: 'success', data: { id: result.lastInsertRowid, token } });
  } catch (err) {
    res.status(409).json({ status: 'error', message: (err as Error).message });
  }
});

// CTF: gdpr_data_erasure — login as a "deleted" user
router.post('/login-deleted', (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};
  const user = getDb().prepare('SELECT * FROM users WHERE email = ?').get(String(email)) as any;
  if (!user) { res.status(401).json({ status: 'error', message: 'Credenciais inválidas' }); return; }
  const bcrypt = require('bcryptjs');
  if (!bcrypt.compareSync(String(password), user.password)) {
    res.status(401).json({ status: 'error', message: 'Credenciais inválidas' }); return;
  }
  // Even inactive accounts can login (the vulnerability)
  if (!user.is_active) {
    (req as any).user = { userId: user.id };
    awardChallenge(req, 'gdprDataErasureChallenge');
  }
  const token = signToken({ userId: user.id, email: user.email, role: user.role });
  res.json({ status: 'success', data: { user: { id: user.id, email: user.email, role: user.role }, token } });
});

// CTF: two_factor_auth — 2FA bypass (accepts any code or empty code)
router.post('/2fa/verify', authenticate, (req: AuthRequest, res: Response) => {
  const { code } = req.body ?? {};
  // Intentionally accepts any code (vulnerability)
  if (code === '' || code === '000000' || code != null) {
    awardChallenge(req, 'twoFactorAuthChallenge');
  }
  res.json({ status: 'success', message: '2FA verified', data: { verified: true } });
});

// CTF: unsigned_jwt — accept JWT with alg=none
router.get('/whoami', (req: Request, res: Response) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ status: 'error', message: 'No token' }); return;
  }
  const token = header.split(' ')[1];
  const parts = token.split('.');
  if (parts.length >= 2) {
    try {
      const headerJson = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
      // If alg is "none", we accept the token without verification (vulnerability!)
      if (headerJson.alg === 'none' || headerJson.alg === 'None') {
        awardChallenge({ ...req, user: { userId: payload.userId } } as any, 'unsignedJwtChallenge');
        res.json({ status: 'success', data: payload });
        return;
      }
    } catch { /* fall through to normal verify */ }
  }
  // Normal verify
  const userId = softUserId(req);
  if (!userId) { res.status(401).json({ status: 'error', message: 'Invalid token' }); return; }
  res.json({ status: 'success', data: { userId } });
});

export default router;
