import { Router, Request, Response } from 'express';
import { getDb } from '../config/database';
import { awardChallenge, softUserId } from '../utils/challenge.util';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();

/**
 * Injection / XSS / Template Injection challenges
 */

// ─── Reflected XSS ───
// Query param echoed in response without escaping
router.get('/track-order', (req: Request, res: Response) => {
  const orderId = String(req.query.id ?? '');
  // Detect XSS payload
  if (/<script|<img|onerror|onload|javascript:/i.test(orderId)) {
    awardChallenge(req, 'reflectedXssChallenge');
  }
  // Intentionally reflects the input unsanitized (for CTF)
  res.send(`<html><body><h2>Rastreamento de Pedido</h2><p>Pedido: ${orderId}</p><p>Status: em trânsito</p></body></html>`);
});

// ─── Server-side XSS Protection bypass ───
// Feedback endpoint with basic server-side filter that can be bypassed
router.post('/feedback-xss', (req: Request, res: Response) => {
  let { comment } = req.body ?? {};
  const original = String(comment ?? '');

  // Weak server-side filter: removes <script> tags only (case-sensitive)
  comment = String(comment ?? '').replace(/<script>/gi, '').replace(/<\/script>/gi, '');

  // If XSS still present after filter, award challenge
  if (/<img|onerror|onload|<iframe|<svg/i.test(comment) && /<script/i.test(original)) {
    awardChallenge(req, 'serverSideXssChallenge');
  } else if (/<img|onerror|onload|<iframe|<svg/i.test(comment)) {
    awardChallenge(req, 'serverSideXssChallenge');
  }

  res.json({ status: 'success', data: { rendered: comment } });
});

// ─── X-Header XSS ───
router.get('/track-result', (req: Request, res: Response) => {
  const headerVal = req.headers['x-user-id'] || req.headers['x-forwarded-for'] || '';
  const val = String(headerVal);
  if (/<script|<img|onerror|javascript:/i.test(val)) {
    awardChallenge(req, 'xHeaderXssChallenge');
  }
  // Reflects header value in response
  res.send(`<html><body><p>Tracking for user: ${val}</p></body></html>`);
});

// ─── NoSQL Injection (manipulação) ───
// Simulates a NoSQL-like query interface
router.post('/nosql/search', (req: Request, res: Response) => {
  const { query } = req.body ?? {};
  const qStr = JSON.stringify(query ?? {});

  // Detect NoSQL operators
  if (/\$ne|\$gt|\$lt|\$or|\$where|\$regex/i.test(qStr)) {
    awardChallenge(req, 'nosqlManipulationChallenge');
  }

  // Always returns sample data (simulated)
  res.json({
    status: 'success',
    data: [{ id: 1, name: 'Admin', email: 'admin@hackburger.com' }],
    note: 'NoSQL query accepted',
  });
});

// ─── NoSQL DoS ───
router.post('/nosql/heavy', (req: Request, res: Response) => {
  const { query } = req.body ?? {};
  const qStr = JSON.stringify(query ?? {});

  // Detect expensive operators like $where with function, deep nesting, regex DoS
  if (/\$where|function|sleep|\$regex.*\.\*\.\*/i.test(qStr)) {
    awardChallenge(req, 'nosqlDosChallenge');
  }
  res.json({ status: 'success', message: 'Query processada' });
});

// ─── NoSQL Exfiltration ───
router.get('/nosql/users', (req: Request, res: Response) => {
  const filter = String(req.query.filter ?? '');
  if (/\$ne|\$gt|\$regex|\$where/i.test(filter)) {
    awardChallenge(req, 'nosqlExfiltrationChallenge');
  }
  // Returns minimal data
  const users = getDb().prepare('SELECT id, name, email FROM users LIMIT 10').all();
  res.json({ status: 'success', data: users });
});

// ─── SSTI (Server-Side Template Injection) ───
router.post('/render-template', (req: Request, res: Response) => {
  const { template } = req.body ?? {};
  const tpl = String(template ?? '');

  // Detect template injection patterns
  if (/\{\{.*\}\}|\$\{.*\}|<%.*%>|#\{.*\}/i.test(tpl)) {
    awardChallenge(req, 'sstiChallenge');
  }

  // Simulated rendering (doesn't actually eval)
  const rendered = tpl
    .replace(/\{\{7\*7\}\}/g, '49')
    .replace(/\{\{config\}\}/g, '[REDACTED]')
    .replace(/\{\{.*?\}\}/g, '[TEMPLATE_BLOCKED]');

  res.json({ status: 'success', data: { rendered } });
});

// ─── Ephemeral Accountant (SQLi to create temporary user) ───
router.get('/accounting', (req: Request, res: Response) => {
  const q = String(req.query.q ?? '');
  if (/insert\s+into|create/i.test(q)) {
    awardChallenge(req, 'ephemeralAccountantChallenge');
  }
  // SQL injection on query param (intentionally vulnerable)
  try {
    const sql = `SELECT id, name, email, total FROM orders WHERE id = '${q}'`;
    const rows = getDb().prepare(sql).all();
    res.json({ status: 'success', data: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: (err as Error).message });
  }
});

// ─── Blocked RCE DoS ───
router.post('/rce-test', (req: Request, res: Response) => {
  const { payload } = req.body ?? {};
  const p = String(payload ?? '');

  // Detect serialization-based RCE attempts
  if (/child_process|exec|spawn|eval|Function|require\(|__proto__|constructor/i.test(p)) {
    awardChallenge(req, 'blockedRceDosChallenge');
    res.status(403).json({ status: 'error', message: 'Payload bloqueado — RCE detectado' });
    return;
  }
  res.json({ status: 'success', message: 'Payload aceito' });
});

// ─── Successful RCE DoS ───
router.post('/rce-exec', (req: Request, res: Response) => {
  const { payload } = req.body ?? {};
  const p = String(payload ?? '');

  // Simulates a successful RCE (doesn't actually execute)
  if (/child_process|exec|spawn|eval\(|require\(/i.test(p) && /sleep|timeout|while.*true/i.test(p)) {
    awardChallenge(req, 'successfulRceDosChallenge');
    res.json({ status: 'success', message: 'Comando executado (simulado)', output: 'DoS triggered' });
    return;
  }
  res.json({ status: 'success', message: 'Nenhum efeito' });
});

// ─── SSRF ───
router.get('/fetch-url', (req: Request, res: Response) => {
  const url = String(req.query.url ?? '');
  // Detect internal URL access attempts
  if (/localhost|127\.0\.0\.1|0\.0\.0\.0|192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\./i.test(url)) {
    awardChallenge(req, 'ssrfChallenge');
  }
  // Don't actually fetch — just acknowledge
  res.json({ status: 'success', message: 'URL processada (simulado)', url });
});

// ─── Email Leak ───
router.get('/email-leak', (req: Request, res: Response) => {
  const orderEmail = String(req.query.email ?? '');
  // Returns order info for any email without auth (information leak)
  const orders = getDb().prepare(
    `SELECT o.id, o.total, o.status FROM orders o
     JOIN users u ON o.user_id = u.id WHERE u.email LIKE ?`
  ).all(`%${orderEmail}%`);

  if (orderEmail && orders.length > 0) {
    awardChallenge(req, 'emailLeakChallenge');
  }
  res.json({ status: 'success', data: orders });
});

export default router;
