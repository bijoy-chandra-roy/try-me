import mongoose, { Schema, model } from 'mongoose';

export interface ReviewDocument {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<ReviewDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '', trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

reviewSchema.index({ userId: 1, productId: 1, orderId: 1 }, { unique: true });

if (mongoose.models.Review) {
  delete (mongoose.models as Record<string, unknown>).Review;
}
if (mongoose.connection.models.Review) {
  delete (mongoose.connection.models as Record<string, unknown>).Review;
}

export const Review = model<ReviewDocument>('Review', reviewSchema);
