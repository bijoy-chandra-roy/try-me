import mongoose, { Schema, model } from 'mongoose';
import type {
  OrderStatus,
  PaymentMethod,
  PaymentProviderName,
  PaymentStatus,
  ShippingAddress,
} from '@/shared/types';

export interface OrderItemDocument {
  productId: mongoose.Types.ObjectId;
  merchantId?: mongoose.Types.ObjectId | null;
  name: string;
  imageUrl: string;
  price: number;
  size?: string;
  customSelections?: Map<string, string> | Record<string, string>;
  quantity: number;
  merchantStatus: OrderStatus;
}

export interface OrderDocument {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItemDocument[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentProvider: PaymentProviderName;
  paymentExternalId?: string;
  subtotal: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

const shippingAddressSchema = new Schema(
  {
    label: { type: String, default: '' },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String, default: '' },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  { _id: false }
);

const orderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    merchantId: { type: Schema.Types.ObjectId, ref: 'Merchant', default: null },
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    size: { type: String, default: '' },
    customSelections: { type: Map, of: String, default: {} },
    quantity: { type: Number, required: true, min: 1 },
    merchantStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
  },
  { _id: false }
);

const orderSchema = new Schema<OrderDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    orderNumber: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },
    items: { type: [orderItemSchema], required: true },
    shippingAddress: { type: shippingAddressSchema, required: true },
    paymentMethod: { type: String, enum: ['cod'], default: 'cod' },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    paymentProvider: { type: String, enum: ['cod', 'stripe'], default: 'cod' },
    paymentExternalId: { type: String, default: '' },
    subtotal: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

orderSchema.index({ 'items.merchantId': 1 });
orderSchema.index({ orderNumber: 1 });

if (mongoose.models.Order) {
  delete (mongoose.models as Record<string, unknown>).Order;
}
if (mongoose.connection.models.Order) {
  delete (mongoose.connection.models as Record<string, unknown>).Order;
}

export const Order = model<OrderDocument>('Order', orderSchema);
