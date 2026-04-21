import { AuthService } from '../../../backend/src/services/auth.service';
import { UserModel } from '../../../backend/src/models/User.model';
import * as hashUtil from '../../../backend/src/utils/hash.util';
import * as jwtUtil from '../../../backend/src/utils/jwt.util';

jest.mock('../../../backend/src/models/User.model');
jest.mock('../../../backend/src/utils/hash.util');
jest.mock('../../../backend/src/utils/jwt.util');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should throw an error with invalid credentials', async () => {
      (UserModel.findByEmail as jest.Mock).mockReturnValue(undefined);

      await expect(AuthService.login({ email: 'test@test.com', password: '123' }))
        .rejects
        .toThrow('Credenciais inválidas');
    });

    it('should return a user and token on successful login', async () => {
      const mockUser = { id: 1, email: 'test@test.com', password: 'hashed_password', role: 'customer', is_active: 1 };
      (UserModel.findByEmail as jest.Mock).mockReturnValue(mockUser);
      (hashUtil.comparePassword as jest.Mock).mockResolvedValue(true);
      (jwtUtil.signToken as jest.Mock).mockReturnValue('mock_token');

      const result = await AuthService.login({ email: 'test@test.com', password: 'password' });

      expect(result.token).toBe('mock_token');
      expect(result.user.email).toBe('test@test.com');
      expect(result.user).not.toHaveProperty('password');
    });
  });
});
