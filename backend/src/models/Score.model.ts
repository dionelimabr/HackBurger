import { getDb } from '../config/database';

export interface UserScore {
  user_id: number;
  points: number;
  challenges_completed: number;
  updated_at: string;
}

export interface LeaderboardEntry {
  user_id: number;
  name: string;
  avatar_url: string | null;
  points: number;
  challenges_completed: number;
  rank: number;
}

export interface ChallengeCompletion {
  id: number;
  user_id: number;
  challenge_key: string;
  points: number;
  completed_at: string;
}

export const ScoreModel = {
  getStats(userId: number): UserScore {
    const row = getDb().prepare(
      'SELECT * FROM user_scores WHERE user_id = ?'
    ).get(userId) as UserScore | undefined;
    return row ?? { user_id: userId, points: 0, challenges_completed: 0, updated_at: '' };
  },

  /**
   * Registers a challenge completion idempotently.
   * Returns { alreadyCompleted, earned, totalPoints }.
   */
  complete(userId: number, challengeKey: string, points: number): {
    alreadyCompleted: boolean;
    earned: number;
    totalPoints: number;
  } {
    const db = getDb();
    const existing = db.prepare(
      'SELECT 1 FROM challenge_completions WHERE user_id = ? AND challenge_key = ?'
    ).get(userId, challengeKey);

    if (existing) {
      const stats = this.getStats(userId);
      return { alreadyCompleted: true, earned: 0, totalPoints: stats.points };
    }

    const tx = db.transaction(() => {
      db.prepare(
        'INSERT INTO challenge_completions (user_id, challenge_key, points) VALUES (?, ?, ?)'
      ).run(userId, challengeKey, points);

      db.prepare(`
        INSERT INTO user_scores (user_id, points, challenges_completed, updated_at)
        VALUES (?, ?, 1, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id) DO UPDATE SET
          points = points + excluded.points,
          challenges_completed = challenges_completed + 1,
          updated_at = CURRENT_TIMESTAMP
      `).run(userId, points);
    });
    tx();

    const stats = this.getStats(userId);
    return { alreadyCompleted: false, earned: points, totalPoints: stats.points };
  },

  leaderboard(limit = 20): LeaderboardEntry[] {
    const rows = getDb().prepare(`
      SELECT s.user_id, u.name, u.avatar_url, s.points, s.challenges_completed
      FROM user_scores s
      JOIN users u ON u.id = s.user_id
      WHERE s.points > 0
      ORDER BY s.points DESC, s.updated_at ASC
      LIMIT ?
    `).all(limit) as Omit<LeaderboardEntry, 'rank'>[];
    return rows.map((r, i) => ({ ...r, rank: i + 1 }));
  },

  getCompletions(userId: number): ChallengeCompletion[] {
    return getDb().prepare(
      'SELECT * FROM challenge_completions WHERE user_id = ? ORDER BY completed_at DESC'
    ).all(userId) as ChallengeCompletion[];
  },
};
