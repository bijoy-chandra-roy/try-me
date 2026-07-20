import mongoose, { Schema, model } from 'mongoose';

export interface AddressDocument {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<AddressDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    label: { type: String, default: 'Home', trim: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, default: '', trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, default: 'US' },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

if (mongoose.models.Address) {
  delete (mongoose.models as Record<string, unknown>).Address;
}
if (mongoose.connection.models.Address) {
  delete (mongoose.connection.models as Record<string, unknown>).Address;
}

export const Address = model<AddressDocument>('Address', addressSchema);
