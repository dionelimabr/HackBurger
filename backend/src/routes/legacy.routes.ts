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
  const email    = String(req.body?.email    ?? '');
  const password = String(req.body?.password ?? '');

  // Deliberately vulnerable: do not do this in real code.
  const sql =
    `SELECT id, email, role FROM users ` +
    `WHERE email = '${email}' AND password = '${password}' AND is_active = 1 LIMIT 1`;

  try {
    const user = getDb().prepare(sql).get() as { id: number; email: string; role: 'admin' | 'customer' } | undefined;

    if (!user) {
      res.status(401).json({ status: 'error', message: 'Credenciais inválidas' });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    (req as any).user = { userId: user.id };

    // The player slipped an SQL payload past the "email" check
    // (password is never actually matched in the DB because of the hash mismatch).
    if (/['"][^'"]*(--|\bor\b|\|\|)/i.test(email) || email.includes("'")) {
      awardChallenge(req, 'loginAdminChallenge');
    }

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
