import { getDb } from '../config/database';

export interface Order {
  id: number;
  user_id: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  subtotal: number;
  delivery_fee: number;
  total: number;
  address_street: string | null;
  address_number: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
  notes: string | null;
  estimated_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface OrderItemWithProduct extends OrderItem {
  product_name: string;
  product_image: string | null;
}

export const OrderModel = {
  findAll(userId?: number): Order[] {
    if (userId) {
      return getDb().prepare(
        'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC'
      ).all(userId) as Order[];
    }
    return getDb().prepare('SELECT * FROM orders ORDER BY created_at DESC').all() as Order[];
  },

  findById(id: number): Order | undefined {
    return getDb().prepare('SELECT * FROM orders WHERE id = ?').get(id) as Order | undefined;
  },

  getItems(orderId: number): OrderItemWithProduct[] {
    return getDb().prepare(`
      SELECT oi.*, p.name as product_name, p.image_url as product_image
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = ?
    `).all(orderId) as OrderItemWithProduct[];
  },

  create(data: Omit<Order, 'id' | 'created_at' | 'updated_at'>): number {
    const result = getDb().prepare(`
      INSERT INTO orders
        (user_id,status,subtotal,delivery_fee,total,address_street,address_number,address_city,address_state,address_zip,notes,estimated_at)
      VALUES
        (@user_id,@status,@subtotal,@delivery_fee,@total,@address_street,@address_number,@address_city,@address_state,@address_zip,@notes,@estimated_at)
    `).run(data);
    return result.lastInsertRowid as number;
  },

  addItems(orderId: number, items: Omit<OrderItem, 'id' | 'order_id'>[]): void {
    const stmt = getDb().prepare(
      'INSERT INTO order_items (order_id,product_id,quantity,unit_price,subtotal) VALUES (?,?,?,?,?)'
    );
    for (const item of items) {
      stmt.run(orderId, item.product_id, item.quantity, item.unit_price, item.subtotal);
    }
  },

  updateStatus(id: number, status: Order['status']): boolean {
    const result = getDb().prepare(
      'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(status, id);
    return result.changes > 0;
  },

  count(): number {
    return (getDb().prepare('SELECT COUNT(*) as t FROM orders').get() as { t: number }).t;
  },

  totalRevenue(): number {
    const row = getDb().prepare(
      "SELECT SUM(total) as rev FROM orders WHERE status = 'delivered'"
    ).get() as { rev: number | null };
    return row.rev ?? 0;
  },
};
