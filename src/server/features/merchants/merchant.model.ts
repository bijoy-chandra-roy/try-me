import mongoose, { Schema, model, models } from 'mongoose';

export interface MerchantDocument {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  ownerId: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

const merchantSchema = new Schema<MerchantDocument>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'suspended'],
      default: 'approved',
    },
  },
  { timestamps: true }
);

export const Merchant =
  models.Merchant || model<MerchantDocument>('Merchant', merchantSchema);
