-- ============================================================
-- HackBurger — Schema Completo SQLite
-- ============================================================

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  email       TEXT    NOT NULL UNIQUE,
  password    TEXT    NOT NULL,
  role        TEXT    NOT NULL DEFAULT 'customer' CHECK(role IN ('customer','admin')),
  phone       TEXT,
  avatar_url  TEXT,
  is_active   INTEGER NOT NULL DEFAULT 1,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL UNIQUE,
  slug        TEXT    NOT NULL UNIQUE,
  description TEXT,
  icon        TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id  INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name         TEXT    NOT NULL,
  slug         TEXT    NOT NULL UNIQUE,
  description  TEXT,
  price        REAL    NOT NULL CHECK(price >= 0),
  image_url    TEXT,
  rating       REAL    NOT NULL DEFAULT 0 CHECK(rating BETWEEN 0 AND 5),
  rating_count INTEGER NOT NULL DEFAULT 0,
  ingredients  TEXT,
  is_available INTEGER NOT NULL DEFAULT 1,
  is_featured  INTEGER NOT NULL DEFAULT 0,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Carts
CREATE TABLE IF NOT EXISTS carts (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status     TEXT    NOT NULL DEFAULT 'active' CHECK(status IN ('active','checked_out','abandoned')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cart Items
CREATE TABLE IF NOT EXISTS cart_items (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  cart_id    INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity   INTEGER NOT NULL DEFAULT 1 CHECK(quantity > 0),
  unit_price REAL    NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Orders
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

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity   INTEGER NOT NULL DEFAULT 1,
  unit_price REAL    NOT NULL,
  subtotal   REAL    NOT NULL
);

-- Payments
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug     ON products(slug);
CREATE INDEX IF NOT EXISTS idx_carts_user        ON carts(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart   ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_orders_user       ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders(status);
CREATE INDEX IF NOT EXISTS idx_payments_order    ON payments(order_id);
