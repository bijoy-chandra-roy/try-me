import mongoose, { Schema, model, models } from 'mongoose';
import type { UserRole } from '@/shared/auth/roles';
import type { UserPreferences } from '@/shared/constants';
import type { UserStatus } from '@/shared/types';

export interface UserDocument {
  _id: mongoose.Types.ObjectId;
  email: string;
  passwordHash?: string;
  name: string;
  role: UserRole;
  merchantId?: mongoose.Types.ObjectId | null;
  status: UserStatus;
  preferences?: UserPreferences | null;
  createdAt: Date;
  updatedAt: Date;
}

const colorTokensSchema = new Schema(
  {
    backgroundBody: { type: String },
    backgroundSurface: { type: String },
    textPrimary: { type: String },
    textSecondary: { type: String },
    accentFill: { type: String },
    onAccent: { type: String },
    border: { type: String },
    borderEmphasized: { type: String },
  },
  { _id: false }
);

const preferencesSchema = new Schema(
  {
    theme: { type: String, enum: ['light', 'dark', 'system'] },
    colorSchemeId: {
      type: String,
      enum: ['olive', 'clay', 'ocean', 'charcoal', 'custom'],
    },
    customScheme: {
      type: new Schema(
        {
          light: { type: colorTokensSchema },
          dark: { type: colorTokensSchema },
        },
        { _id: false }
      ),
      default: null,
    },
    fontPairId: { type: String, enum: ['brand', 'modern', 'classic', 'bengali'] },
    locale: { type: String, enum: ['en', 'bn'] },
    reduceMotion: { type: Boolean },
    cardTilt: { type: Boolean },
  },
  { _id: false }
);

const userSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      required: true,
      enum: ['customer', 'merchant', 'support', 'admin', 'super_admin'],
      default: 'customer',
    },
    merchantId: { type: Schema.Types.ObjectId, ref: 'Merchant', default: null },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    preferences: { type: preferencesSchema, default: null },
  },
  { timestamps: true }
);

export const User = models.User || model<UserDocument>('User', userSchema);
