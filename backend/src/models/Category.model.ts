import { getDb } from '../config/database';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  created_at: string;
}

export const CategoryModel = {
  findAll(): Category[] {
    return getDb().prepare('SELECT * FROM categories ORDER BY name').all() as Category[];
  },

  findById(id: number): Category | undefined {
    return getDb().prepare('SELECT * FROM categories WHERE id = ?').get(id) as Category | undefined;
  },

  findBySlug(slug: string): Category | undefined {
    return getDb().prepare('SELECT * FROM categories WHERE slug = ?').get(slug) as Category | undefined;
  },

  create(data: Omit<Category, 'id' | 'created_at'>): number {
    const result = getDb().prepare(
      'INSERT INTO categories (name, slug, description, icon) VALUES (@name, @slug, @description, @icon)'
    ).run(data);
    return result.lastInsertRowid as number;
  },

  update(id: number, data: Partial<Omit<Category, 'id' | 'created_at'>>): boolean {
    const fields = Object.keys(data).map(k => `${k} = @${k}`).join(', ');
    const result = getDb().prepare(`UPDATE categories SET ${fields} WHERE id = @id`).run({ ...data, id });
    return result.changes > 0;
  },

  delete(id: number): boolean {
    const result = getDb().prepare('DELETE FROM categories WHERE id = ?').run(id);
    return result.changes > 0;
  },
};
