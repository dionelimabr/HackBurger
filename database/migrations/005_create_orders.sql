-- Migration 005 — Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER NOT NULL REFERENCES users(id),
  status          TEXT    NOT NULL DEFAULT 'pending'
                  CHECK(status IN ('pending','confirmed','preparing','out_for_delivery','delivered','cancelled')),
  subtotal        REAL    NOT NULL DEFAULT 0,
  delivery_fee    REAL    NOT NULL DEFAULT 0,
  total           REAL    NOT NULL DEFAULT 0,
  address_street  TEXT,
  address_number  TEXT,
  address_city    TEXT,
  address_state   TEXT,
  address_zip     TEXT,
  notes           TEXT,
  estimated_at    DATETIME,
  delivered_at    DATETIME,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity   INTEGER NOT NULL DEFAULT 1,
  unit_price REAL    NOT NULL,
  subtotal   REAL    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_user   ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
