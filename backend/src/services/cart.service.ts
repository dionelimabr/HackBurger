import { CartModel } from '../models/Cart.model';
import { ProductModel } from '../models/Product.model';
import { createError } from '../middlewares/errorHandler.middleware';

export const CartService = {
  async getCart(userId: number) {
    const cart  = CartModel.getOrCreateCart(userId);
    const items = CartModel.getItems(cart.id);
    const total = CartModel.getTotal(cart.id);
    return { cart, items, total };
  },

  async addItem(userId: number, productId: number, quantity: number) {
    const product = ProductModel.findById(productId);
    if (!product)           throw createError('Produto não encontrado', 404);
    if (!product.is_available) throw createError('Produto indisponível', 400);

    const cart = CartModel.getOrCreateCart(userId);
    CartModel.addItem(cart.id, productId, quantity, product.price);
    return this.getCart(userId);
  },

  async updateItem(userId: number, itemId: number, quantity: number) {
    const cart = CartModel.getOrCreateCart(userId);
    if (quantity <= 0) {
      CartModel.removeItem(cart.id, itemId);
    } else {
      const updated = CartModel.updateItemQuantity(cart.id, itemId, quantity);
      if (!updated) throw createError('Item não encontrado no carrinho', 404);
    }
    return this.getCart(userId);
  },

  async removeItem(userId: number, itemId: number) {
    const cart    = CartModel.getOrCreateCart(userId);
    const removed = CartModel.removeItem(cart.id, itemId);
    if (!removed) throw createError('Item não encontrado no carrinho', 404);
    return this.getCart(userId);
  },

  async clearCart(userId: number) {
    const cart = CartModel.getOrCreateCart(userId);
    CartModel.clearCart(cart.id);
    return this.getCart(userId);
  },
};
