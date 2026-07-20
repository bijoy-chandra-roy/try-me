import mongoose, { Schema, model, models } from 'mongoose';
import type { UserRole } from '@/shared/auth/roles';
import type { UserStatus } from '@/shared/types';

export interface UserDocument {
  _id: mongoose.Types.ObjectId;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  merchantId?: mongoose.Types.ObjectId | null;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      required: true,
      enum: ['customer', 'merchant', 'support', 'admin', 'super_admin'],
      default: 'customer',
    },
    merchantId: { type: Schema.Types.ObjectId, ref: 'Merchant', default: null },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

export const User = models.User || model<UserDocument>('User', userSchema);
