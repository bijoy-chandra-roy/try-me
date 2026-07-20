import mongoose, { Schema, model } from 'mongoose';

export interface CartItemDocument {
  productId: mongoose.Types.ObjectId;
  merchantId?: mongoose.Types.ObjectId | null;
  name: string;
  imageUrl: string;
  price: number;
  size?: string;
  customSelections?: Map<string, string> | Record<string, string>;
  quantity: number;
}

export interface CartDocument {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  items: CartItemDocument[];
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    merchantId: { type: Schema.Types.ObjectId, ref: 'Merchant', default: null },
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    size: { type: String, default: '' },
    customSelections: { type: Map, of: String, default: {} },
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: false }
);

const cartSchema = new Schema<CartDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: { type: [cartItemSchema], default: [] },
  },
  { timestamps: true }
);

if (mongoose.models.Cart) {
  delete (mongoose.models as Record<string, unknown>).Cart;
}
if (mongoose.connection.models.Cart) {
  delete (mongoose.connection.models as Record<string, unknown>).Cart;
}

export const Cart = model<CartDocument>('Cart', cartSchema);
