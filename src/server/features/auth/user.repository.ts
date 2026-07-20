import type { UserRole } from '@/shared/auth/roles';
import type { UserStatus } from '@/shared/types';
import { User, type UserDocument } from './user.model';

export type UserRecord = Omit<UserDocument, '_id' | 'passwordHash' | 'merchantId'> & {
  _id: string;
  merchantId?: string | null;
};

export type SafeUserRecord = UserRecord;

class UserRepository {
  private toRecord(doc: UserDocument | Record<string, unknown>): UserRecord {
    const d = doc as UserDocument;
    return {
      _id: String(d._id),
      email: d.email,
      name: d.name,
      role: d.role,
      merchantId: d.merchantId ? String(d.merchantId) : null,
      status: d.status,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    };
  }

  async findByEmail(email: string) {
    return User.findOne({ email: email.toLowerCase() });
  }

  async findById(id: string): Promise<UserRecord | null> {
    const user = await User.findById(id).lean();
    if (!user) return null;
    return this.toRecord(user as unknown as UserDocument);
  }

  async findByIdWithPassword(id: string) {
    return User.findById(id);
  }

  async findAll(filters?: { role?: UserRole; search?: string }): Promise<UserRecord[]> {
    const query: Record<string, unknown> = {};
    if (filters?.role) query.role = filters.role;
    if (filters?.search) {
      query.$or = [
        { email: { $regex: filters.search, $options: 'i' } },
        { name: { $regex: filters.search, $options: 'i' } },
      ];
    }
    const users = await User.find(query).sort({ createdAt: -1 }).lean();
    return users.map((u) => this.toRecord(u as unknown as UserDocument));
  }

  async create(data: {
    email: string;
    passwordHash?: string;
    name: string;
    role?: UserRole;
    merchantId?: string | null;
    status?: UserStatus;
  }) {
    const user = await User.create({
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      name: data.name,
      role: data.role ?? 'customer',
      merchantId: data.merchantId ?? null,
      status: data.status ?? 'active',
    });
    return this.toRecord(user);
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      role: UserRole;
      merchantId: string | null;
      status: UserStatus;
      passwordHash: string;
    }>
  ): Promise<UserRecord | null> {
    const user = await User.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!user) return null;
    return this.toRecord(user as unknown as UserDocument);
  }

  async count(): Promise<number> {
    return User.countDocuments();
  }
}

export const userRepository = new UserRepository();
