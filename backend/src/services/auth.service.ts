import { UserModel } from '../models/User.model';
import { hashPassword, comparePassword } from '../utils/hash.util';
import { signToken } from '../utils/jwt.util';
import { createError } from '../middlewares/errorHandler.middleware';

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export const AuthService = {
  async register(dto: RegisterDto) {
    const existing = UserModel.findByEmail(dto.email);
    if (existing) throw createError('E-mail já cadastrado', 409);

    const hashed = await hashPassword(dto.password);
    const id = UserModel.create({
      name: dto.name,
      email: dto.email,
      password: hashed,
      role: 'customer',
      phone: dto.phone ?? null,
      avatar_url: null,
      is_active: 1,
    });

    const user  = UserModel.findById(id)!;
    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    return { user, token };
  },

  async login(dto: LoginDto) {
    const user = UserModel.findByEmail(dto.email);
    if (!user) throw createError('Credenciais inválidas', 401);
    if (!user.is_active) throw createError('Conta desativada', 403);

    const valid = await comparePassword(dto.password, user.password);
    if (!valid) throw createError('Credenciais inválidas', 401);

    const { password: _, ...userPublic } = user;
    const token = signToken({ userId: userPublic.id, email: userPublic.email, role: userPublic.role });
    return { user: userPublic, token };
  },

  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const user = UserModel.findByEmail(
      (UserModel.findById(userId) as { email: string })?.email
    );
    if (!user) throw createError('Usuário não encontrado', 404);

    const valid = await comparePassword(oldPassword, user.password);
    if (!valid) throw createError('Senha atual incorreta', 400);

    const hashed = await hashPassword(newPassword);
    UserModel.update(userId, { password: hashed });
  },
};
