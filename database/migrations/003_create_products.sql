-- Migration 003 — Create Products Table
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

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug     ON products(slug);
