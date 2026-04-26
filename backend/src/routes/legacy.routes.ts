import { Router, Request, Response } from 'express';
import { getDb } from '../config/database';
import { signToken } from '../utils/jwt.util';
import { awardChallenge } from '../utils/challenge.util';

const router = Router();

/**
 * Legacy authentication endpoints left around from the "old stack".
 * These are intentionally broken to host multiple CTF challenges.
 */

// CTF: login_admin — classic boolean-based SQL injection in a string-concat
// query. Payload example:  email="admin'--" password="anything"
router.post('/login', (req: Request, res: Response) => {
  const bcrypt = require('bcryptjs');
  const email    = String(req.body?.email    ?? '');
  const password = String(req.body?.password ?? '');

  // Detect SQLi payloads early
  const isSqli = /['"][^'"]*(--|\bor\b|\|\|)/i.test(email) || email.includes("'");

  // Deliberately vulnerable: do not do this in real code.
  const sql =
    `SELECT id, email, role FROM users ` +
    `WHERE email = '${email}' AND password = '${password}' AND is_active = 1 LIMIT 1`;

  try {
    let user = getDb().prepare(sql).get() as { id: number; email: string; role: 'admin' | 'customer' } | undefined;

    // Fallback: bcrypt comparison for hashed passwords (allows normal logins)
    if (!user && !isSqli) {
      const row = getDb().prepare('SELECT id, email, role, password FROM users WHERE email = ? AND is_active = 1')
        .get(email) as { id: number; email: string; role: 'admin' | 'customer'; password: string } | undefined;
      if (row && bcrypt.compareSync(password, row.password)) {
        user = { id: row.id, email: row.email, role: row.role };
      }
    }

    if (!user) {
      res.status(401).json({ status: 'error', message: 'Credenciais inválidas' });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    (req as any).user = { userId: user.id };

    // Award specific login challenges based on which user was accessed
    if (isSqli) {
      if (user.email === 'admin@hackburger.com' || user.role === 'admin') awardChallenge(req, 'loginAdminChallenge');
      if (user.email === 'lucas@hackburger.com')   awardChallenge(req, 'loginJimChallenge');
      if (user.email === 'roberto@hackburger.com')  awardChallenge(req, 'loginBenderChallenge');
      if (user.email === 'ana@hackburger.com')      awardChallenge(req, 'loginAmyChallenge');
      if (user.email === 'caio@hackburger.com')     awardChallenge(req, 'loginBjoernChallenge');
      if (user.email === 'viktor@hackburger.com')   awardChallenge(req, 'loginUvoginChallenge');
    }

    // Password-based logins (weak passwords, OSINT)
    if (user.email === 'dj.trovao@hackburger.com') awardChallenge(req, 'loginMcSafeSearchChallenge');
    if (user.email === 'admin@hackburger.com' && !isSqli) awardChallenge(req, 'passwordStrengthChallenge');

    res.json({ status: 'success', data: { user, token } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Legacy login failure', detail: (err as Error).message });
  }
});

// CTF: empty_user_registration — no validation at all; accepts empty strings.
router.post('/register', (req: Request, res: Response) => {
  const { name = '', email = '', password = '' } = req.body ?? {};

  const db = getDb();
  try {
    const result = db.prepare(
      `INSERT INTO users (name, email, password, role, is_active) VALUES (?, ?, ?, 'customer', 1)`
    ).run(name, email, password);

    if (String(email).trim() === '' || String(name).trim() === '') {
      (req as any).user = { userId: result.lastInsertRowid };
      awardChallenge(req, 'emptyUserRegistrationChallenge');
    }

    res.status(201).json({ status: 'success', data: { id: result.lastInsertRowid } });
  } catch (err) {
    res.status(409).json({ status: 'error', message: (err as Error).message });
  }
});

export default router;
