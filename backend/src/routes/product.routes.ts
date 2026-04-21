import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';

const router = Router();

router.get('/', ProductController.getAll);
router.get('/featured', ProductController.getFeatured);
router.get('/categories', ProductController.getCategories);
router.get('/:id(\\d+)', ProductController.getById);
router.get('/slug/:slug', ProductController.getBySlug);

export default router;
