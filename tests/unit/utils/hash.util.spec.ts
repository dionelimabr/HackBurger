import { hashPassword, comparePassword } from '../../../backend/src/utils/hash.util';

describe('Hash Utils', () => {
  it('should hash a password and verify it', async () => {
    const password = 'mySecretPassword';
    const hash = await hashPassword(password);
    
    expect(hash).not.toBe(password);
    
    const isValid = await comparePassword(password, hash);
    expect(isValid).toBe(true);
    
    const isInvalid = await comparePassword('wrongPassword', hash);
    expect(isInvalid).toBe(false);
  });
});
