-- CTF infrastructure tables

-- Security questions for password reset (intentionally vulnerable)
CREATE TABLE IF NOT EXISTS security_questions (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question TEXT    NOT NULL,
  answer   TEXT    NOT NULL,
  UNIQUE(user_id)
);

-- Product reviews (for forged_review, forged_feedback challenges)
CREATE TABLE IF NOT EXISTS reviews (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  author     TEXT    NOT NULL,
  rating     INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  comment    TEXT    NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Coupon codes (for expired_coupon, forged_coupon challenges)
CREATE TABLE IF NOT EXISTS coupons (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  code       TEXT    NOT NULL UNIQUE,
  discount   REAL    NOT NULL CHECK(discount > 0 AND discount <= 100),
  is_active  INTEGER NOT NULL DEFAULT 1,
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Likes on reviews (for multiples_likes challenge)
CREATE TABLE IF NOT EXISTS review_likes (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  review_id INTEGER NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(review_id, user_id)
);

-- Notifications (for mass_dispel challenge)
CREATE TABLE IF NOT EXISTS notifications (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message    TEXT    NOT NULL,
  is_read    INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- GDPR erasure log
CREATE TABLE IF NOT EXISTS gdpr_erasures (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL,
  email      TEXT    NOT NULL,
  erased_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_security_questions_user ON security_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
