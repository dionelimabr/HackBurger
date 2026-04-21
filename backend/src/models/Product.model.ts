import { getDb } from '../config/database';

export interface Product {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image_url: string | null;
  rating: number;
  rating_count: number;
  ingredients: string | null; // JSON string
  is_available: number;
  is_featured: number;
  created_at: string;
  updated_at: string;
}

export interface ProductWithCategory extends Product {
  category_name: string;
  category_slug: string;
}

export const ProductModel = {
  findAll(opts?: { categoryId?: number; featured?: boolean; page?: number; limit?: number }): {
    items: ProductWithCategory[];
    total: number;
  } {
    const db    = getDb();
    const page  = opts?.page  ?? 1;
    const limit = opts?.limit ?? 12;
    const offset = (page - 1) * limit;

    let where = 'WHERE p.is_available = 1';
    const params: Record<string, unknown> = {};

    if (opts?.categoryId) { where += ' AND p.category_id = @categoryId'; params.categoryId = opts.categoryId; }
    if (opts?.featured)   { where += ' AND p.is_featured = 1'; }

    const baseSql = `
      FROM products p
      JOIN categories c ON c.id = p.category_id
      ${where}
    `;

    const total = (db.prepare(`SELECT COUNT(*) as total ${baseSql}`).get(params) as { total: number }).total;
    const items = db.prepare(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      ${baseSql}
      ORDER BY p.is_featured DESC, p.rating DESC
      LIMIT @limit OFFSET @offset
    `).all({ ...params, limit, offset }) as ProductWithCategory[];

    return { items, total };
  },

  findById(id: number): ProductWithCategory | undefined {
    return getDb().prepare(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p JOIN categories c ON c.id = p.category_id
      WHERE p.id = ?
    `).get(id) as ProductWithCategory | undefined;
  },

  findBySlug(slug: string): ProductWithCategory | undefined {
    return getDb().prepare(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p JOIN categories c ON c.id = p.category_id
      WHERE p.slug = ?
    `).get(slug) as ProductWithCategory | undefined;
  },

  search(query: string): ProductWithCategory[] {
    return getDb().prepare(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p JOIN categories c ON c.id = p.category_id
      WHERE p.is_available = 1 AND (p.name LIKE @q OR p.description LIKE @q)
      LIMIT 20
    `).all({ q: `%${query}%` }) as ProductWithCategory[];
  },

  create(data: Omit<Product, 'id' | 'created_at' | 'updated_at'>): number {
    const result = getDb().prepare(`
      INSERT INTO products (category_id,name,slug,description,price,image_url,rating,rating_count,ingredients,is_available,is_featured)
      VALUES (@category_id,@name,@slug,@description,@price,@image_url,@rating,@rating_count,@ingredients,@is_available,@is_featured)
    `).run(data);
    return result.lastInsertRowid as number;
  },

  update(id: number, data: Partial<Omit<Product, 'id' | 'created_at'>>): boolean {
    const fields = Object.keys(data).map(k => `${k} = @${k}`).join(', ');
    const result = getDb().prepare(
      `UPDATE products SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = @id`
    ).run({ ...data, id });
    return result.changes > 0;
  },

  delete(id: number): boolean {
    const result = getDb().prepare('DELETE FROM products WHERE id = ?').run(id);
    return result.changes > 0;
  },

  count(): number {
    return (getDb().prepare('SELECT COUNT(*) as total FROM products').get() as { total: number }).total;
  },
};
