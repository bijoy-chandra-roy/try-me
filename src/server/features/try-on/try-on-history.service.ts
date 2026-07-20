import { tryOnHistoryRepository } from '@/server/features/try-on/try-on-history.repository';
import type { TryOnResult } from '@/shared/types';

class TryOnHistoryService {
  async saveHistory(
    userId: string | null,
    productId: string,
    result: TryOnResult
  ) {
    return tryOnHistoryRepository.create({
      userId,
      productId,
      productName: result.productName,
      compositeImageUrl: result.compositeImageUrl,
      userImageUrl: result.userImageUrl,
      productImageUrl: result.productImageUrl,
      source: result.source,
      fromFallback: result.fromFallback,
    });
  }

  async getUserHistory(userId: string) {
    return tryOnHistoryRepository.findByUserId(userId);
  }

  async getAllHistory(limit = 100) {
    return tryOnHistoryRepository.findAll(limit);
  }

  async getMerchantStats(productIds: string[]) {
    const tryOnCount = await tryOnHistoryRepository.count({ productIds });
    const perProduct = await tryOnHistoryRepository.countByProductIds(productIds);
    return { tryOnCount, perProduct };
  }
}

export const tryOnHistoryService = new TryOnHistoryService();
