import mongoose from 'mongoose';
import { TryOnHistory, type TryOnHistoryDocument } from './try-on-history.model';

export type TryOnHistoryRecord = Omit<TryOnHistoryDocument, '_id' | 'userId' | 'productId'> & {
  _id: string;
  userId?: string | null;
  productId: string;
};

class TryOnHistoryRepository {
  private toRecord(doc: TryOnHistoryDocument | Record<string, unknown>): TryOnHistoryRecord {
    const d = doc as TryOnHistoryDocument;
    return {
      _id: String(d._id),
      userId: d.userId ? String(d.userId) : null,
      productId: String(d.productId),
      productName: d.productName,
      compositeImageUrl: d.compositeImageUrl,
      userImageUrl: d.userImageUrl,
      productImageUrl: d.productImageUrl,
      source: d.source,
      fromFallback: d.fromFallback,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    };
  }

  async create(data: {
    userId?: string | null;
    productId: string;
    productName: string;
    compositeImageUrl: string;
    userImageUrl: string;
    productImageUrl: string;
    source: 'vto-api' | 'fallback-cache';
    fromFallback: boolean;
  }) {
    const record = await TryOnHistory.create(data);
    return this.toRecord(record);
  }

  async findByUserId(userId: string, limit = 50): Promise<TryOnHistoryRecord[]> {
    const records = await TryOnHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return records.map((r) => this.toRecord(r as unknown as TryOnHistoryDocument));
  }

  async findAll(limit = 100): Promise<TryOnHistoryRecord[]> {
    const records = await TryOnHistory.find().sort({ createdAt: -1 }).limit(limit).lean();
    return records.map((r) => this.toRecord(r as unknown as TryOnHistoryDocument));
  }

  async countByProductIds(productIds: string[]): Promise<Record<string, number>> {
    if (productIds.length === 0) return {};
    const objectIds = productIds.map((id) => new mongoose.Types.ObjectId(id));
    const results = await TryOnHistory.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
      { $match: { productId: { $in: objectIds } } },
      { $group: { _id: '$productId', count: { $sum: 1 } } },
    ]);
    const counts: Record<string, number> = {};
    for (const r of results) {
      counts[String(r._id)] = r.count;
    }
    return counts;
  }

  async count(filters?: { userId?: string; productIds?: string[] }): Promise<number> {
    const query: Record<string, unknown> = {};
    if (filters?.userId) query.userId = filters.userId;
    if (filters?.productIds?.length) query.productId = { $in: filters.productIds };
    return TryOnHistory.countDocuments(query);
  }
}

export const tryOnHistoryRepository = new TryOnHistoryRepository();
