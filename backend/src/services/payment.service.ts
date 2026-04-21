import { PaymentModel } from '../models/Payment.model';
import { OrderModel } from '../models/Order.model';
import { createError } from '../middlewares/errorHandler.middleware';

export interface ProcessPaymentDto {
  orderId: number;
  method: 'credit_card' | 'debit_card' | 'pix' | 'cash';
}

export const PaymentService = {
  async processPayment(dto: ProcessPaymentDto) {
    const order = OrderModel.findById(dto.orderId);
    if (!order) throw createError('Pedido não encontrado', 404);

    const existing = PaymentModel.findByOrderId(dto.orderId);
    if (existing?.status === 'approved') throw createError('Pedido já pago', 400);

    // Simula aprovação do pagamento (mock)
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const paymentId = PaymentModel.create({
      order_id: dto.orderId,
      method: dto.method,
      status: 'approved',
      amount: order.total,
      transaction_id: transactionId,
      paid_at: new Date().toISOString(),
    });

    OrderModel.updateStatus(dto.orderId, 'confirmed');

    return PaymentModel.findById(paymentId)!;
  },

  async getPaymentByOrder(orderId: number) {
    const payment = PaymentModel.findByOrderId(orderId);
    if (!payment) throw createError('Pagamento não encontrado', 404);
    return payment;
  },

  async refund(paymentId: number) {
    const payment = PaymentModel.findById(paymentId);
    if (!payment) throw createError('Pagamento não encontrado', 404);
    if (payment.status !== 'approved') throw createError('Pagamento não aprovado', 400);

    PaymentModel.updateStatus(paymentId, 'refunded');
    OrderModel.updateStatus(payment.order_id, 'cancelled');

    return PaymentModel.findById(paymentId)!;
  },
};
