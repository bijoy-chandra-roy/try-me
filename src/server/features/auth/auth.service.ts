import bcrypt from 'bcryptjs';
import type { UserRole } from '@/shared/auth/roles';
import { canAssignRole } from '@/shared/auth/roles';
import { AppError } from '@/server/lib/errors';
import { userRepository } from './user.repository';

const SALT_ROUNDS = 12;

class AuthService {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async verifyPassword(password: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
  }

  async register(data: { email: string; password: string; name: string }) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new AppError('Email already registered', 409);
    }

    if (data.password.length < 8) {
      throw new AppError('Password must be at least 8 characters', 400);
    }

    const passwordHash = await this.hashPassword(data.password);
    return userRepository.create({
      email: data.email,
      passwordHash,
      name: data.name,
      role: 'customer',
    });
  }

  async validateCredentials(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (user.status === 'inactive') {
      throw new AppError('Account is inactive', 403);
    }

    const valid = await this.verifyPassword(password, user.passwordHash);
    if (!valid) {
      throw new AppError('Invalid email or password', 401);
    }

    return userRepository.findById(String(user._id));
  }

  async updateProfile(
    userId: string,
    data: { name?: string; password?: string }
  ) {
    const updates: { name?: string; passwordHash?: string } = {};
    if (data.name) updates.name = data.name;
    if (data.password) {
      if (data.password.length < 8) {
        throw new AppError('Password must be at least 8 characters', 400);
      }
      updates.passwordHash = await this.hashPassword(data.password);
    }

    const user = await userRepository.update(userId, updates);
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  async createUser(
    assignerRole: UserRole,
    data: {
      email: string;
      password: string;
      name: string;
      role: UserRole;
      merchantId?: string | null;
    }
  ) {
    if (!canAssignRole(assignerRole, data.role)) {
      throw new AppError('Insufficient permissions to assign this role', 403);
    }

    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new AppError('Email already registered', 409);
    }

    const passwordHash = await this.hashPassword(data.password);
    return userRepository.create({
      email: data.email,
      passwordHash,
      name: data.name,
      role: data.role,
      merchantId: data.merchantId ?? null,
    });
  }

  async updateUserRole(
    assignerRole: UserRole,
    userId: string,
    data: { role?: UserRole; status?: 'active' | 'inactive'; name?: string; merchantId?: string | null }
  ) {
    const target = await userRepository.findById(userId);
    if (!target) throw new AppError('User not found', 404);

    if (data.role && !canAssignRole(assignerRole, data.role)) {
      throw new AppError('Insufficient permissions to assign this role', 403);
    }

    if (target.role === 'super_admin' && assignerRole !== 'super_admin') {
      throw new AppError('Cannot modify super admin accounts', 403);
    }

    return userRepository.update(userId, data);
  }
}

export const authService = new AuthService();
