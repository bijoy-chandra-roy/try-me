import mongoose, { Schema, model } from 'mongoose';
import type { ProductCategory, ProductCustomField } from '@/shared/types';

export interface ProductDocument {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  imageUrl: string;
  sizes: string[];
  customFields: ProductCustomField[];
  inStock: boolean;
  merchantId?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const customFieldSchema = new Schema(
  {
    label: { type: String, default: '', trim: true },
    options: { type: [String], default: [] },
  },
  { _id: false }
);

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
    sizes: { type: [String], default: [] },
    customFields: { type: [customFieldSchema], default: [] },
    inStock: { type: Boolean, default: true },
    merchantId: { type: Schema.Types.ObjectId, ref: 'Merchant', default: null },
  },
  { timestamps: true }
);

// Next.js HMR keeps a stale compiled model; drop it so schema changes apply.
if (mongoose.models.Product) {
  delete mongoose.models.Product;
}
if (mongoose.connection.models.Product) {
  delete mongoose.connection.models.Product;
}

export const Product = model<ProductDocument>('Product', productSchema);
