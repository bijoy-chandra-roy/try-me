import mongoose from 'mongoose';
import { Review, type ReviewDocument } from './review.model';
import { userRepository } from '@/server/features/auth/user.repository';

export type ReviewRecord = {
  _id: string;
  userId: string;
  productId: string;
  orderId: string;
  rating: number;
  comment: string;
  userName?: string;
  createdAt: Date;
  updatedAt: Date;
};

class ReviewRepository {
  private toRecord(doc: ReviewDocument, userName?: string): ReviewRecord {
    return {
      _id: String(doc._id),
      userId: String(doc.userId),
      productId: String(doc.productId),
      orderId: String(doc.orderId),
      rating: doc.rating,
      comment: doc.comment,
      userName,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async findByProduct(productId: string): Promise<ReviewRecord[]> {
    const docs = await Review.find({ productId }).sort({ createdAt: -1 }).lean();
    const records: ReviewRecord[] = [];
    for (const doc of docs) {
      const user = await userRepository.findById(String(doc.userId));
      records.push(this.toRecord(doc as unknown as ReviewDocument, user?.name));
    }
    return records;
  }

  async findByUser(userId: string): Promise<ReviewRecord[]> {
    const docs = await Review.find({ userId }).sort({ createdAt: -1 }).lean();
    return docs.map((d) => this.toRecord(d as unknown as ReviewDocument));
  }

  async findById(id: string): Promise<ReviewRecord | null> {
    const doc = await Review.findById(id).lean();
    if (!doc) return null;
    return this.toRecord(doc as unknown as ReviewDocument);
  }

  async create(data: {
    userId: string;
    productId: string;
    orderId: string;
    rating: number;
    comment: string;
  }): Promise<ReviewRecord> {
    const doc = await Review.create(data);
    const user = await userRepository.findById(data.userId);
    return this.toRecord(doc, user?.name);
  }

  async update(
    id: string,
    data: { rating?: number; comment?: string }
  ): Promise<ReviewRecord | null> {
    const doc = await Review.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
    if (!doc) return null;
    return this.toRecord(doc as unknown as ReviewDocument);
  }

  async delete(id: string): Promise<boolean> {
    const result = await Review.findByIdAndDelete(id);
    return !!result;
  }

  async getStatsForProducts(
    productIds: string[]
  ): Promise<Map<string, { averageRating: number; reviewCount: number }>> {
    if (productIds.length === 0) return new Map();
    const objectIds = productIds
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    const results = await Review.aggregate([
      { $match: { productId: { $in: objectIds } } },
      {
        $group: {
          _id: '$productId',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    const map = new Map<string, { averageRating: number; reviewCount: number }>();
    for (const row of results) {
      map.set(String(row._id), {
        averageRating: Math.round(row.averageRating * 10) / 10,
        reviewCount: row.reviewCount,
      });
    }
    return map;
  }
}

export const reviewRepository = new ReviewRepository();
