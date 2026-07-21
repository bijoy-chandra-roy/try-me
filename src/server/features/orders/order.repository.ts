import type {
  OrderItem,
  OrderStatus,
  PaymentMethod,
  PaymentProviderName,
  PaymentStatus,
  ShippingAddress,
} from '@/shared/types';
import mongoose from 'mongoose';
import { escapeRegex } from '@/server/lib/escape-regex';
import { Order, type OrderDocument } from './order.model';

export type OrderRecord = {
  _id: string;
  userId: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentProvider: PaymentProviderName;
  paymentExternalId?: string;
  subtotal: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateOrderInput = {
  userId: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentProvider: PaymentProviderName;
  paymentExternalId?: string;
  subtotal: number;
  total: number;
};

function mapSelections(
  selections?: Map<string, string> | Record<string, string>
): Record<string, string> {
  if (!selections) return {};
  if (selections instanceof Map) return Object.fromEntries(selections.entries());
  return { ...selections };
}

class OrderRepository {
  toRecord(doc: OrderDocument): OrderRecord {
    return {
      _id: String(doc._id),
      userId: String(doc.userId),
      orderNumber: doc.orderNumber,
      status: doc.status,
      items: (doc.items ?? []).map((item) => ({
        productId: String(item.productId),
        merchantId: item.merchantId ? String(item.merchantId) : null,
        name: item.name,
        imageUrl: item.imageUrl,
        price: item.price,
        size: item.size || undefined,
        customSelections: mapSelections(item.customSelections),
        quantity: item.quantity,
        merchantStatus: item.merchantStatus,
      })),
      shippingAddress: doc.shippingAddress,
      paymentMethod: doc.paymentMethod,
      paymentStatus: doc.paymentStatus,
      paymentProvider: doc.paymentProvider,
      paymentExternalId: doc.paymentExternalId || undefined,
      subtotal: doc.subtotal,
      total: doc.total,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async create(data: CreateOrderInput): Promise<OrderRecord> {
    const doc = await Order.create({
      ...data,
      items: data.items.map((item) => ({
        ...item,
        merchantId: item.merchantId || null,
        size: item.size || '',
        customSelections: item.customSelections || {},
      })),
    });
    return this.toRecord(doc);
  }

  async findById(id: string): Promise<OrderRecord | null> {
    const doc = await Order.findById(id).lean();
    if (!doc) return null;
    return this.toRecord(doc as unknown as OrderDocument);
  }

  async findByOrderNumber(orderNumber: string): Promise<OrderRecord | null> {
    const doc = await Order.findOne({ orderNumber }).lean();
    if (!doc) return null;
    return this.toRecord(doc as unknown as OrderDocument);
  }

  async findByUser(userId: string): Promise<OrderRecord[]> {
    const docs = await Order.find({ userId }).sort({ createdAt: -1 }).lean();
    return docs.map((d) => this.toRecord(d as unknown as OrderDocument));
  }

  async findAll(limit = 100): Promise<OrderRecord[]> {
    const docs = await Order.find({}).sort({ createdAt: -1 }).limit(limit).lean();
    return docs.map((d) => this.toRecord(d as unknown as OrderDocument));
  }

  async findByMerchant(merchantId: string): Promise<OrderRecord[]> {
    const docs = await Order.find({ 'items.merchantId': merchantId })
      .sort({ createdAt: -1 })
      .lean();
    return docs.map((d) => this.toRecord(d as unknown as OrderDocument));
  }

  async search(query: {
    orderNumber?: string;
    userId?: string;
  }): Promise<OrderRecord[]> {
    const filter: Record<string, unknown> = {};
    if (query.orderNumber) {
      filter.orderNumber = { $regex: escapeRegex(query.orderNumber), $options: 'i' };
    }
    if (query.userId) filter.userId = query.userId;
    const docs = await Order.find(filter).sort({ createdAt: -1 }).limit(50).lean();
    return docs.map((d) => this.toRecord(d as unknown as OrderDocument));
  }

  async update(id: string, data: Partial<OrderRecord>): Promise<OrderRecord | null> {
    const update: Record<string, unknown> = {};
    if (data.status !== undefined) update.status = data.status;
    if (data.items !== undefined) update.items = data.items;
    if (data.paymentStatus !== undefined) update.paymentStatus = data.paymentStatus;
    if (data.paymentProvider !== undefined) update.paymentProvider = data.paymentProvider;
    if (data.paymentExternalId !== undefined) update.paymentExternalId = data.paymentExternalId;

    const doc = await Order.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
    if (!doc) return null;
    return this.toRecord(doc as unknown as OrderDocument);
  }

  async count(): Promise<number> {
    return Order.countDocuments({});
  }

  async sumRevenue(): Promise<number> {
    const result = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    return result[0]?.total ?? 0;
  }

  async countByMerchant(merchantId: string): Promise<number> {
    return Order.countDocuments({ 'items.merchantId': merchantId, status: { $ne: 'cancelled' } });
  }

  async unitsSoldByMerchant(merchantId: string): Promise<number> {
    if (!mongoose.Types.ObjectId.isValid(merchantId)) return 0;
    const oid = new mongoose.Types.ObjectId(merchantId);
    const result = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' }, 'items.merchantId': oid } },
      { $unwind: '$items' },
      { $match: { 'items.merchantId': oid } },
      { $group: { _id: null, units: { $sum: '$items.quantity' } } },
    ]);
    return result[0]?.units ?? 0;
  }
}

export const orderRepository = new OrderRepository();
