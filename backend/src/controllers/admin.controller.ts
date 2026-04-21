import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { ProductService } from '../services/product.service';
import { OrderModel } from '../models/Order.model';
import { ProductModel } from '../models/Product.model';
import { UserModel } from '../models/User.model';
import { sendSuccess, sendCreated } from '../utils/response.util';

export const AdminController = {
  async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = {
        totalUsers: UserModel.count(),
        totalProducts: ProductModel.count(),
        totalOrders: OrderModel.count(),
        totalRevenue: OrderModel.totalRevenue(),
      };
      sendSuccess(res, stats);
    } catch (err) { next(err); }
  },

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await UserService.getAllUsers();
      sendSuccess(res, users);
    } catch (err) { next(err); }
  },

  async deactivateUser(req: Request, res: Response, next: NextFunction) {
    try {
      await UserService.deactivateUser(Number(req.params.id));
      sendSuccess(res, null, 'Usuário desativado');
    } catch (err) { next(err); }
  },

  async activateUser(req: Request, res: Response, next: NextFunction) {
    try {
      await UserService.activateUser(Number(req.params.id));
      sendSuccess(res, null, 'Usuário ativado');
    } catch (err) { next(err); }
  },

  async getAllOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await OrderModel.findAll();
      sendSuccess(res, orders);
    } catch (err) { next(err); }
  },
};
