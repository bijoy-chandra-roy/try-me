import mongoose, { Schema, model, models } from 'mongoose';
import type { ProductCategory } from '@/shared/types';

export interface ProductDocument {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  imageUrl: string;
  sizes: string[];
  inStock: boolean;
  merchantId?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<ProductDocument>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      required: true,
      enum: ['tops', 'bottoms', 'dresses', 'outerwear', 'accessories'],
    },
    imageUrl: { type: String, required: true },
    sizes: [{ type: String }],
    inStock: { type: Boolean, default: true },
    merchantId: { type: Schema.Types.ObjectId, ref: 'Merchant', default: null },
  },
  { timestamps: true }
);

export const Product =
  models.Product || model<ProductDocument>('Product', productSchema);
