import { getDb } from '../config/database';

export interface Payment {
  id: number;
  order_id: number;
  method: 'credit_card' | 'debit_card' | 'pix' | 'cash';
  status: 'pending' | 'approved' | 'refused' | 'refunded';
  amount: number;
  transaction_id: string | null;
  paid_at: string | null;
  created_at: string;
}

export const PaymentModel = {
  findByOrderId(orderId: number): Payment | undefined {
    return getDb().prepare('SELECT * FROM payments WHERE order_id = ?').get(orderId) as Payment | undefined;
  },

  findById(id: number): Payment | undefined {
    return getDb().prepare('SELECT * FROM payments WHERE id = ?').get(id) as Payment | undefined;
  },

  create(data: Omit<Payment, 'id' | 'created_at'>): number {
    const result = getDb().prepare(`
      INSERT INTO payments (order_id, method, status, amount, transaction_id, paid_at)
      VALUES (@order_id, @method, @status, @amount, @transaction_id, @paid_at)
    `).run(data);
    return result.lastInsertRowid as number;
  },

  updateStatus(id: number, status: Payment['status'], transactionId?: string): boolean {
    const paidAt = status === 'approved' ? new Date().toISOString() : null;
    const result = getDb().prepare(`
      UPDATE payments
      SET status = ?, transaction_id = COALESCE(?, transaction_id), paid_at = ?
      WHERE id = ?
    `).run(status, transactionId ?? null, paidAt, id);
    return result.changes > 0;
  },
};
