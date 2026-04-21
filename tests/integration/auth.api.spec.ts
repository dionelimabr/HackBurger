import frisby from 'frisby';

const API_URL = 'http://localhost:3000/api';

describe('Auth API Integration Tests', () => {
  it('should not allow login with invalid credentials', async () => {
    await frisby
      .post(`${API_URL}/auth/login`, {
        email: 'invalid@test.com',
        password: 'wrongpassword'
      })
      .expect('status', 401);
  });
});
