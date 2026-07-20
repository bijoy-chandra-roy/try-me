import mongoose, { Schema, model, models } from 'mongoose';

export interface SystemConfigDocument {
  _id: mongoose.Types.ObjectId;
  maintenanceMode: boolean;
  guestTryOnLimit: number;
  updatedAt: Date;
}

const systemConfigSchema = new Schema<SystemConfigDocument>(
  {
    maintenanceMode: { type: Boolean, default: false },
    guestTryOnLimit: { type: Number, default: 3, min: 1, max: 20 },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

export const SystemConfig =
  models.SystemConfig || model<SystemConfigDocument>('SystemConfig', systemConfigSchema);
