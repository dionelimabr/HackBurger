import frisby from 'frisby';

const API_URL = 'http://localhost:3000/api';

describe('Products API Integration Tests', () => {
  it('should fetch paginated catalog', async () => {
    await frisby
      .get(`${API_URL}/products`)
      .expect('status', 200)
      .expect('jsonTypes', 'data', Array);
  });

  it('should fetch featured products', async () => {
    await frisby
      .get(`${API_URL}/products/featured`)
      .expect('status', 200)
      .expect('jsonTypes', 'data', Array);
  });
});
