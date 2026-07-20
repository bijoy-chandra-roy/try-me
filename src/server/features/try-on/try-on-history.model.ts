import mongoose, { Schema, model, models } from 'mongoose';

export interface TryOnHistoryDocument {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId | null;
  productId: mongoose.Types.ObjectId;
  productName: string;
  compositeImageUrl: string;
  userImageUrl: string;
  productImageUrl: string;
  source: 'vto-api' | 'fallback-cache';
  fromFallback: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const tryOnHistorySchema = new Schema<TryOnHistoryDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    compositeImageUrl: { type: String, required: true },
    userImageUrl: { type: String, required: true },
    productImageUrl: { type: String, required: true },
    source: { type: String, enum: ['vto-api', 'fallback-cache'], required: true },
    fromFallback: { type: Boolean, required: true },
  },
  { timestamps: true }
);

tryOnHistorySchema.index({ userId: 1, createdAt: -1 });
tryOnHistorySchema.index({ productId: 1 });

export const TryOnHistory =
  models.TryOnHistory ||
  model<TryOnHistoryDocument>('TryOnHistory', tryOnHistorySchema);
