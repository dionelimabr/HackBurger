import { ProductModel, ProductWithCategory } from '../models/Product.model';
import { CategoryModel } from '../models/Category.model';
import { paginate, getPaginationOffset } from '../utils/paginate.util';
import { createError } from '../middlewares/errorHandler.middleware';

export interface ProductFilterDto {
  categoryId?: number;
  categorySlug?: string;
  featured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export const ProductService = {
  async getAll(filters: ProductFilterDto) {
    let categoryId = filters.categoryId;

    if (filters.categorySlug && !categoryId) {
      const cat = CategoryModel.findBySlug(filters.categorySlug);
      categoryId = cat?.id;
    }

    if (filters.search) {
      const items = ProductModel.search(filters.search);
      return paginate(items, items.length, { page: 1, limit: items.length });
    }

    const { items, total } = ProductModel.findAll({
      categoryId,
      featured: filters.featured,
      page: filters.page,
      limit: filters.limit,
    });

    return paginate(items, total, { page: filters.page, limit: filters.limit });
  },

  async getById(id: number): Promise<ProductWithCategory> {
    const product = ProductModel.findById(id);
    if (!product) throw createError('Produto não encontrado', 404);
    return product;
  },

  async getBySlug(slug: string): Promise<ProductWithCategory> {
    const product = ProductModel.findBySlug(slug);
    if (!product) throw createError('Produto não encontrado', 404);
    return product;
  },

  async getFeatured() {
    const { items } = ProductModel.findAll({ featured: true, limit: 8 });
    return items;
  },

  async create(data: Omit<ProductWithCategory, 'id' | 'created_at' | 'updated_at' | 'category_name' | 'category_slug'>) {
    const id = ProductModel.create({ ...data, rating: 0, rating_count: 0 });
    return ProductModel.findById(id)!;
  },

  async update(id: number, data: Partial<ProductWithCategory>) {
    const exists = ProductModel.findById(id);
    if (!exists) throw createError('Produto não encontrado', 404);
    ProductModel.update(id, data);
    return ProductModel.findById(id)!;
  },

  async delete(id: number): Promise<void> {
    const exists = ProductModel.findById(id);
    if (!exists) throw createError('Produto não encontrado', 404);
    ProductModel.delete(id);
  },

  getCategories() {
    return CategoryModel.findAll();
  },
};
