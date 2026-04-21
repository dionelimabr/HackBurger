import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { sendSuccess, sendCreated } from '../utils/response.util';

export const ProductController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, featured, search, page, limit } = req.query;
      const result = await ProductService.getAll({
        categorySlug: category as string,
        featured: featured === 'true',
        search: search as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 12,
      });
      sendSuccess(res, result.data, 'Produtos listados', 200, result.pagination);
    } catch (err) { next(err); }
  },

  async getFeatured(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await ProductService.getFeatured();
      sendSuccess(res, products, 'Produtos em destaque');
    } catch (err) { next(err); }
  },

  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const cats = ProductService.getCategories();
      sendSuccess(res, cats, 'Categorias listadas');
    } catch (err) { next(err); }
  },

  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.getBySlug(req.params.slug);
      sendSuccess(res, product);
    } catch (err) { next(err); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.getById(Number(req.params.id));
      sendSuccess(res, product);
    } catch (err) { next(err); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.create(req.body);
      sendCreated(res, product, 'Produto criado');
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.update(Number(req.params.id), req.body);
      sendSuccess(res, product, 'Produto atualizado');
    } catch (err) { next(err); }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await ProductService.delete(Number(req.params.id));
      sendSuccess(res, null, 'Produto removido');
    } catch (err) { next(err); }
  },
};
