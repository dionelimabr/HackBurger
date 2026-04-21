import { ProductService } from '../../../backend/src/services/product.service';
import { ProductModel } from '../../../backend/src/models/Product.model';

jest.mock('../../../backend/src/models/Product.model');

describe('ProductService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return paginated products', async () => {
      const mockItems = [{ id: 1, name: 'Burger' }];
      (ProductModel.findAll as jest.Mock).mockReturnValue({ items: mockItems, total: 1 });

      const result = await ProductService.getAll({});

      expect(result.data).toEqual(mockItems);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('getById', () => {
    it('should throw error if product not found', async () => {
      (ProductModel.findById as jest.Mock).mockReturnValue(undefined);

      await expect(ProductService.getById(999)).rejects.toThrow('Produto não encontrado');
    });

    it('should return product if found', async () => {
      (ProductModel.findById as jest.Mock).mockReturnValue({ id: 1, name: 'Test' });
      
      const product = await ProductService.getById(1);
      
      expect(product.name).toBe('Test');
    });
  });
});
