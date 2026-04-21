import { UserModel, UserPublic } from '../models/User.model';
import { hashPassword } from '../utils/hash.util';
import { createError } from '../middlewares/errorHandler.middleware';

export interface UpdateProfileDto {
  name?: string;
  phone?: string;
  avatar_url?: string;
}

export const UserService = {
  async getProfile(userId: number): Promise<UserPublic> {
    const user = UserModel.findById(userId);
    if (!user) throw createError('Usuário não encontrado', 404);
    return user;
  },

  async updateProfile(userId: number, dto: UpdateProfileDto): Promise<UserPublic> {
    const updated = UserModel.update(userId, dto);
    if (!updated) throw createError('Usuário não encontrado', 404);
    return UserModel.findById(userId)!;
  },

  async getAllUsers(): Promise<UserPublic[]> {
    return UserModel.findAll();
  },

  async getUserById(id: number): Promise<UserPublic> {
    const user = UserModel.findById(id);
    if (!user) throw createError('Usuário não encontrado', 404);
    return user;
  },

  async deactivateUser(id: number): Promise<void> {
    const updated = UserModel.update(id, { is_active: 0 });
    if (!updated) throw createError('Usuário não encontrado', 404);
  },

  async activateUser(id: number): Promise<void> {
    const updated = UserModel.update(id, { is_active: 1 });
    if (!updated) throw createError('Usuário não encontrado', 404);
  },
};
