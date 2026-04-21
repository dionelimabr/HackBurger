import { getDb } from '../config/database';

export interface Cart {
  id: number;
  user_id: number;
  status: 'active' | 'checked_out' | 'abandoned';
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  created_at: string;
}

export interface CartItemWithProduct extends CartItem {
  product_name: string;
  product_slug: string;
  product_image: string | null;
}

export const CartModel = {
  findActiveByUser(userId: number): Cart | undefined {
    return getDb().prepare(
      "SELECT * FROM carts WHERE user_id = ? AND status = 'active'"
    ).get(userId) as Cart | undefined;
  },

  createCart(userId: number): number {
    const result = getDb().prepare(
      "INSERT INTO carts (user_id, status) VALUES (?, 'active')"
    ).run(userId);
    return result.lastInsertRowid as number;
  },

  getOrCreateCart(userId: number): Cart {
    const existing = this.findActiveByUser(userId);
    if (existing) return existing;
    const id = this.createCart(userId);
    return this.findActiveByUser(userId)!;
  },

  getItems(cartId: number): CartItemWithProduct[] {
    return getDb().prepare(`
      SELECT ci.*, p.name as product_name, p.slug as product_slug, p.image_url as product_image
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      WHERE ci.cart_id = ?
    `).all(cartId) as CartItemWithProduct[];
  },

  addItem(cartId: number, productId: number, quantity: number, unitPrice: number): void {
    const db = getDb();
    const existing = db.prepare(
      'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?'
    ).get(cartId, productId) as CartItem | undefined;

    if (existing) {
      db.prepare('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?')
        .run(quantity, existing.id);
    } else {
      db.prepare(
        'INSERT INTO cart_items (cart_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)'
      ).run(cartId, productId, quantity, unitPrice);
    }
  },

  updateItemQuantity(cartId: number, itemId: number, quantity: number): boolean {
    const result = getDb().prepare(
      'UPDATE cart_items SET quantity = ? WHERE id = ? AND cart_id = ?'
    ).run(quantity, itemId, cartId);
    return result.changes > 0;
  },

  removeItem(cartId: number, itemId: number): boolean {
    const result = getDb().prepare(
      'DELETE FROM cart_items WHERE id = ? AND cart_id = ?'
    ).run(itemId, cartId);
    return result.changes > 0;
  },

  clearCart(cartId: number): void {
    getDb().prepare('DELETE FROM cart_items WHERE cart_id = ?').run(cartId);
  },

  checkout(cartId: number): void {
    getDb().prepare(
      "UPDATE carts SET status = 'checked_out', updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).run(cartId);
  },

  getTotal(cartId: number): number {
    const row = getDb().prepare(
      'SELECT SUM(quantity * unit_price) as total FROM cart_items WHERE cart_id = ?'
    ).get(cartId) as { total: number | null };
    return row.total ?? 0;
  },
};
