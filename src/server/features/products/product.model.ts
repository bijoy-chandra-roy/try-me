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
  stockQuantity: number;
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
    stockQuantity: { type: Number, default: 0, min: 0 },
    merchantId: { type: Schema.Types.ObjectId, ref: 'Merchant', default: null },
  },
  { timestamps: true }
);

productSchema.pre('validate', function syncStock(next) {
  if (typeof this.stockQuantity === 'number') {
    this.inStock = this.stockQuantity > 0;
  } else if (typeof this.inStock === 'boolean' && this.stockQuantity == null) {
    this.stockQuantity = this.inStock ? 10 : 0;
    this.inStock = this.stockQuantity > 0;
  }
  next();
});

// Next.js HMR keeps a stale compiled model; drop it so schema changes apply.
if (mongoose.models.Product) {
  delete (mongoose.models as Record<string, unknown>).Product;
}
if (mongoose.connection.models.Product) {
  delete (mongoose.connection.models as Record<string, unknown>).Product;
}

export const Product = model<ProductDocument>('Product', productSchema);
