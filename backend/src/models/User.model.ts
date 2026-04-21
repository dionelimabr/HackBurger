import { getDb } from '../config/database';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'admin';
  phone: string | null;
  avatar_url: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export type UserPublic = Omit<User, 'password'>;

export const UserModel = {
  findAll(): UserPublic[] {
    return getDb().prepare(
      'SELECT id,name,email,role,phone,avatar_url,is_active,created_at,updated_at FROM users ORDER BY id DESC'
    ).all() as UserPublic[];
  },

  findById(id: number): UserPublic | undefined {
    return getDb().prepare(
      'SELECT id,name,email,role,phone,avatar_url,is_active,created_at,updated_at FROM users WHERE id = ?'
    ).get(id) as UserPublic | undefined;
  },

  findByEmail(email: string): User | undefined {
    return getDb().prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;
  },

  create(data: Omit<User, 'id' | 'created_at' | 'updated_at'>): number {
    const result = getDb().prepare(
      `INSERT INTO users (name, email, password, role, phone, avatar_url, is_active)
       VALUES (@name, @email, @password, @role, @phone, @avatar_url, @is_active)`
    ).run(data);
    return result.lastInsertRowid as number;
  },

  update(id: number, data: Partial<Omit<User, 'id' | 'created_at'>>): boolean {
    const db = getDb();
    const fields = Object.keys(data).map(k => `${k} = @${k}`).join(', ');
    const result = db.prepare(
      `UPDATE users SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = @id`
    ).run({ ...data, id });
    return result.changes > 0;
  },

  delete(id: number): boolean {
    const result = getDb().prepare('DELETE FROM users WHERE id = ?').run(id);
    return result.changes > 0;
  },

  count(): number {
    const row = getDb().prepare('SELECT COUNT(*) as total FROM users').get() as { total: number };
    return row.total;
  },
};
