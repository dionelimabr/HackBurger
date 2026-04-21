-- Rankings / gamification
CREATE TABLE IF NOT EXISTS user_scores (
  user_id INTEGER PRIMARY KEY,
  points INTEGER NOT NULL DEFAULT 0,
  challenges_completed INTEGER NOT NULL DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS challenge_completions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  challenge_key TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, challenge_key),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_scores_points ON user_scores(points DESC);
CREATE INDEX IF NOT EXISTS idx_completions_user ON challenge_completions(user_id);
