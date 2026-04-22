import { Router, Request, Response } from 'express';
import { getDb } from '../config/database';
import { awardChallenge, softUserId } from '../utils/challenge.util';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();

/**
 * CTF data-related challenges: reviews, GDPR export, user credentials dump,
 * product tampering, schema leaking, coupon manipulation, etc.
 */

// ─── Reviews CRUD (forged_review, forged_feedback, multiples_likes) ───

router.get('/reviews/:productId', (req: Request, res: Response) => {
  const reviews = getDb().prepare(
    'SELECT r.*, (SELECT COUNT(*) FROM review_likes WHERE review_id = r.id) as likes FROM reviews r WHERE product_id = ? ORDER BY created_at DESC'
  ).all(Number(req.params.productId));
  res.json({ status: 'success', data: reviews });
});

router.post('/reviews', (req: Request, res: Response) => {
  const { product_id, author, rating, comment, user_id } = req.body ?? {};
  const callerId = softUserId(req);

  // CTF: forged_review — user_id in body differs from authenticated user
  const effectiveUserId = user_id ?? callerId ?? 0;
  if (callerId && user_id && Number(user_id) !== callerId) {
    awardChallenge(req, 'forgedReviewChallenge');
  }

  try {
    const result = getDb().prepare(
      'INSERT INTO reviews (product_id, user_id, author, rating, comment) VALUES (?, ?, ?, ?, ?)'
    ).run(product_id, effectiveUserId, author || 'Anonymous', rating || 3, comment || '');
    res.status(201).json({ status: 'success', data: { id: result.lastInsertRowid } });
  } catch (err) {
    res.status(400).json({ status: 'error', message: (err as Error).message });
  }
});

router.put('/reviews/:id', (req: Request, res: Response) => {
  const { author, comment, rating } = req.body ?? {};
  const review = getDb().prepare('SELECT * FROM reviews WHERE id = ?').get(Number(req.params.id)) as any;
  if (!review) { res.status(404).json({ status: 'error', message: 'Review não encontrada' }); return; }

  const callerId = softUserId(req);
  // CTF: forged_review — editing another user's review
  if (callerId && review.user_id !== callerId) {
    awardChallenge(req, 'forgedReviewChallenge');
  }

  getDb().prepare('UPDATE reviews SET author = COALESCE(?, author), comment = COALESCE(?, comment), rating = COALESCE(?, rating), updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(author, comment, rating, Number(req.params.id));
  res.json({ status: 'success', message: 'Review atualizada' });
});

// CTF: multiples_likes — like a review multiple times (UNIQUE constraint bypassed with DELETE first)
router.post('/reviews/:id/like', (req: Request, res: Response) => {
  const reviewId = Number(req.params.id);
  const userId = softUserId(req);
  if (!userId) { res.status(401).json({ status: 'error', message: 'Auth required' }); return; }

  try {
    getDb().prepare('INSERT INTO review_likes (review_id, user_id) VALUES (?, ?)').run(reviewId, userId);
    res.json({ status: 'success', message: 'Liked' });
  } catch {
    // Already liked — the challenge is to bypass this via timing or API manipulation
    res.status(409).json({ status: 'error', message: 'Já curtiu esta review' });
  }
});

// CTF: multiples_likes — intentionally allows removing like to re-like
router.delete('/reviews/:id/like', (req: Request, res: Response) => {
  const reviewId = Number(req.params.id);
  const userId = softUserId(req);
  if (!userId) { res.status(401).json({ status: 'error', message: 'Auth required' }); return; }
  getDb().prepare('DELETE FROM review_likes WHERE review_id = ? AND user_id = ?').run(reviewId, userId);

  // Check total likes — if user managed to get >1 like on same review, award
  const count = (getDb().prepare('SELECT COUNT(*) as c FROM review_likes WHERE review_id = ? AND user_id = ?').get(reviewId, userId) as any)?.c ?? 0;
  // Alternative: detect rapid like/unlike/like cycles via timestamp (simplified here)
  awardChallenge(req, 'multiplesLikesChallenge');
  res.json({ status: 'success', message: 'Like removido' });
});

// ─── GDPR Export (gdpr_data_theft) ───

router.get('/gdpr/export', authenticate, (req: AuthRequest, res: Response) => {
  // CTF: accepts userId override — IDOR
  const targetId = req.query.userId ? Number(req.query.userId) : req.user!.userId;
  if (targetId !== req.user!.userId) {
    awardChallenge(req, 'gdprDataTheftChallenge');
  }
  const user = getDb().prepare('SELECT id, name, email, role, phone, created_at FROM users WHERE id = ?').get(targetId);
  const orders = getDb().prepare('SELECT id, total, status, created_at FROM orders WHERE user_id = ?').all(targetId);
  res.json({ status: 'success', data: { user, orders } });
});

// ─── User Credentials Dump (via legacy search with SQLi) ───

router.get('/users/search', (req: Request, res: Response) => {
  const q = String(req.query.q ?? '');
  // Deliberately vulnerable SQL string concatenation
  const sql = `SELECT id, name, email, role, created_at FROM users WHERE name LIKE '%${q}%' OR email LIKE '%${q}%'`;
  try {
    const rows = getDb().prepare(sql).all();
    // Detect UNION-based SQLi
    if (/union/i.test(q)) {
      if (/select/i.test(q) && /from/i.test(q)) {
        awardChallenge(req, 'userCredentialsChallenge');
      }
      // Also check for schema dump
      if (/sqlite_master|sqlite_schema/i.test(q)) {
        awardChallenge(req, 'databaseSchemaChallenge');
      }
    }
    res.json({ status: 'success', data: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: (err as Error).message });
  }
});

// ─── Product Tampering ───

router.put('/products/:id/description', (req: Request, res: Response) => {
  const { description } = req.body ?? {};
  // No admin check — anyone can edit product descriptions (vulnerability)
  const callerId = softUserId(req);
  if (callerId) {
    const user = getDb().prepare('SELECT role FROM users WHERE id = ?').get(callerId) as { role: string } | undefined;
    if (user?.role !== 'admin') {
      awardChallenge(req, 'productTamperingChallenge');
    }
  }
  getDb().prepare('UPDATE products SET description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(String(description), Number(req.params.id));
  res.json({ status: 'success', message: 'Produto atualizado' });
});

// ─── Coupon Apply (expired_coupon, forged_coupon) ───

router.post('/coupons/apply', (req: Request, res: Response) => {
  const { code } = req.body ?? {};
  const coupon = getDb().prepare('SELECT * FROM coupons WHERE code = ?').get(String(code)) as any;
  if (!coupon) { res.status(404).json({ status: 'error', message: 'Cupom não encontrado' }); return; }

  // CTF: expired_coupon — backend still applies it
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    awardChallenge(req, 'expiredCouponChallenge');
  }

  // CTF: forged_coupon — the code pattern is z85-encoded (simplified: just check if unknown code works)
  if (!coupon.is_active) {
    awardChallenge(req, 'forgedCouponChallenge');
  }

  res.json({ status: 'success', data: { discount: coupon.discount, code: coupon.code } });
});

// ─── Notifications (mass_dispel) ───

router.get('/notifications', authenticate, (req: AuthRequest, res: Response) => {
  const notifs = getDb().prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.user!.userId);
  res.json({ status: 'success', data: notifs });
});

router.delete('/notifications/all', authenticate, (req: AuthRequest, res: Response) => {
  const result = getDb().prepare('DELETE FROM notifications WHERE user_id = ?').run(req.user!.userId);
  if (result.changes >= 3) {
    awardChallenge(req, 'massDispelChallenge');
  }
  res.json({ status: 'success', message: `${result.changes} notificações removidas` });
});

// ─── Leaked/unsafe product ───

router.get('/products/hidden', (req: Request, res: Response) => {
  // Returns products that are unavailable (is_available = 0)
  const hidden = getDb().prepare('SELECT id, name, slug, price, description FROM products WHERE is_available = 0').all();
  awardChallenge(req, 'leakedUnsafeProductChallenge');
  res.json({ status: 'success', data: hidden });
});

// ─── Christmas Special (order discontinued product via API) ───

router.post('/orders/special', authenticate, (req: AuthRequest, res: Response) => {
  const { productId, quantity } = req.body ?? {};
  const product = getDb().prepare('SELECT * FROM products WHERE id = ?').get(Number(productId)) as any;
  if (!product) { res.status(404).json({ status: 'error', message: 'Produto não encontrado' }); return; }

  // Allows ordering unavailable products (vulnerability)
  if (!product.is_available) {
    awardChallenge(req, 'christmasSpecialChallenge');
  }
  res.json({ status: 'success', message: 'Pedido especial criado', data: { product: product.name, quantity } });
});

export default router;
