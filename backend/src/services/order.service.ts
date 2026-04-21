import { OrderModel } from '../models/Order.model';
import { CartModel } from '../models/Cart.model';
import { createError } from '../middlewares/errorHandler.middleware';
import { ordersCreatedTotal } from '../metrics/prometheus';

export interface CheckoutDto {
  userId: number;
  address_street: string;
  address_number: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  notes?: string;
}

const DELIVERY_FEE = 5.90;

export const OrderService = {
  async getUserOrders(userId: number) {
    return OrderModel.findAll(userId).map(order => ({
      ...order,
      items: OrderModel.getItems(order.id),
    }));
  },

  async getOrderById(orderId: number, userId?: number) {
    const order = OrderModel.findById(orderId);
    if (!order) throw createError('Pedido não encontrado', 404);
    if (userId && order.user_id !== userId) throw createError('Acesso negado', 403);

    const items = OrderModel.getItems(orderId);
    return { ...order, items };
  },

  async checkout(dto: CheckoutDto) {
    const cart  = CartModel.findActiveByUser(dto.userId);
    if (!cart) throw createError('Carrinho não encontrado', 400);

    const items = CartModel.getItems(cart.id);
    if (items.length === 0) throw createError('Carrinho vazio', 400);

    const subtotal    = items.reduce((acc, i) => acc + i.quantity * i.unit_price, 0);
    const deliveryFee = DELIVERY_FEE;
    const total       = subtotal + deliveryFee;

    const estimatedAt = new Date(Date.now() + 40 * 60 * 1000).toISOString();

    const orderId = OrderModel.create({
      user_id: dto.userId,
      status: 'pending',
      subtotal,
      delivery_fee: deliveryFee,
      total,
      address_street: dto.address_street,
      address_number: dto.address_number,
      address_city: dto.address_city,
      address_state: dto.address_state,
      address_zip: dto.address_zip,
      notes: dto.notes ?? null,
      estimated_at: estimatedAt,
      delivered_at: null,
    });

    OrderModel.addItems(orderId, items.map(i => ({
      product_id: i.product_id,
      quantity:   i.quantity,
      unit_price: i.unit_price,
      subtotal:   i.quantity * i.unit_price,
    })));

    CartModel.clearCart(cart.id);
    CartModel.checkout(cart.id);

    ordersCreatedTotal.inc();

    return OrderModel.findById(orderId)!;
  },

  async updateStatus(orderId: number, status: string) {
    const valid = ['pending','confirmed','preparing','out_for_delivery','delivered','cancelled'];
    if (!valid.includes(status)) throw createError('Status inválido', 400);

    const updated = OrderModel.updateStatus(orderId, status as any);
    if (!updated) throw createError('Pedido não encontrado', 404);

    return OrderModel.findById(orderId)!;
  },
};
