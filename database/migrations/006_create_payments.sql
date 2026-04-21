-- Migration 006 — Create Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id       INTEGER NOT NULL REFERENCES orders(id),
  method         TEXT    NOT NULL CHECK(method IN ('credit_card','debit_card','pix','cash')),
  status         TEXT    NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','refused','refunded')),
  amount         REAL    NOT NULL,
  transaction_id TEXT,
  paid_at        DATETIME,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
