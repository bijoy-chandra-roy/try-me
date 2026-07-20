import type { CartItem } from '@/shared/types';
import { Cart, type CartDocument } from './cart.model';

export type CartRecord = {
  _id: string;
  userId: string;
  items: CartItem[];
  updatedAt: Date;
};

function mapToRecord(selections?: Map<string, string> | Record<string, string>): Record<string, string> {
  if (!selections) return {};
  if (selections instanceof Map) {
    return Object.fromEntries(selections.entries());
  }
  return { ...selections };
}

function itemKey(item: {
  productId: string;
  size?: string;
  customSelections?: Record<string, string>;
}): string {
  const custom = JSON.stringify(item.customSelections ?? {});
  return `${item.productId}|${item.size ?? ''}|${custom}`;
}

class CartRepository {
  private toRecord(doc: CartDocument): CartRecord {
    return {
      _id: String(doc._id),
      userId: String(doc.userId),
      items: (doc.items ?? []).map((item) => ({
        productId: String(item.productId),
        merchantId: item.merchantId ? String(item.merchantId) : null,
        name: item.name,
        imageUrl: item.imageUrl,
        price: item.price,
        size: item.size || undefined,
        customSelections: mapToRecord(item.customSelections),
        quantity: item.quantity,
      })),
      updatedAt: doc.updatedAt,
    };
  }

  async findByUser(userId: string): Promise<CartRecord | null> {
    const doc = await Cart.findOne({ userId }).lean();
    if (!doc) return null;
    return this.toRecord(doc as unknown as CartDocument);
  }

  async getOrCreate(userId: string): Promise<CartRecord> {
    let doc = await Cart.findOne({ userId });
    if (!doc) {
      doc = await Cart.create({ userId, items: [] });
    }
    return this.toRecord(doc);
  }

  async saveItems(userId: string, items: CartItem[]): Promise<CartRecord> {
    const doc = await Cart.findOneAndUpdate(
      { userId },
      {
        $set: {
          items: items.map((item) => ({
            productId: item.productId,
            merchantId: item.merchantId || null,
            name: item.name,
            imageUrl: item.imageUrl,
            price: item.price,
            size: item.size || '',
            customSelections: item.customSelections || {},
            quantity: item.quantity,
          })),
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    return this.toRecord(doc!);
  }

  async clear(userId: string): Promise<CartRecord> {
    return this.saveItems(userId, []);
  }

  sameLineItem(
    a: { productId: string; size?: string; customSelections?: Record<string, string> },
    b: { productId: string; size?: string; customSelections?: Record<string, string> }
  ): boolean {
    return itemKey(a) === itemKey(b);
  }
}

export const cartRepository = new CartRepository();
