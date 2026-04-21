import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { ProductController } from '../controllers/product.controller';
import { OrderController } from '../controllers/order.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate, requireAdmin);

// Dashboard
router.get('/dashboard', AdminController.getDashboardStats);

// Users
router.get('/users', AdminController.getAllUsers);
router.patch('/users/:id/deactivate', AdminController.deactivateUser);
router.patch('/users/:id/activate', AdminController.activateUser);

// Products (CRUD admin)
router.post('/products', ProductController.create);
router.put('/products/:id', ProductController.update);
router.delete('/products/:id', ProductController.delete);

// Orders
router.get('/orders', AdminController.getAllOrders);
router.patch('/orders/:id/status', OrderController.updateStatus);

export default router;
