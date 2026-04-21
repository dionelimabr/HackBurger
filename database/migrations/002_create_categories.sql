-- Migration 002 — Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL UNIQUE,
  slug        TEXT    NOT NULL UNIQUE,
  description TEXT,
  icon        TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
