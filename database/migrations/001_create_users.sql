-- Migration 001 — Create Users Table
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
