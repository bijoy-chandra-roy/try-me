import mongoose from 'mongoose';
import { ensureDbConnection } from '@/server/db/connection';
import { userRepository } from '@/server/features/auth/user.repository';
import { merchantRepository } from '@/server/features/merchants/merchant.repository';
import { productRepository } from '@/server/features/products/product.repository';
import { tryOnHistoryRepository } from '@/server/features/try-on/try-on-history.repository';
import type { DashboardStats } from '@/shared/types';

export async function getDashboardStats(): Promise<DashboardStats> {
  await ensureDbConnection();

  const [totalUsers, totalProducts, totalMerchants, totalTryOns, recentTryOns] =
    await Promise.all([
      userRepository.count(),
      productRepository.count(),
      merchantRepository.count(),
      tryOnHistoryRepository.count(),
      tryOnHistoryRepository.findAll(10),
    ]);

  return {
    totalUsers,
    totalProducts,
    totalMerchants,
    totalTryOns,
    recentTryOns: recentTryOns.map((r) => ({
      _id: r._id,
      userId: r.userId,
      productId: r.productId,
      productName: r.productName,
      compositeImageUrl: r.compositeImageUrl,
      userImageUrl: r.userImageUrl,
      productImageUrl: r.productImageUrl,
      source: r.source,
      fromFallback: r.fromFallback,
      createdAt: r.createdAt.toISOString(),
    })),
  };
}

export async function getMerchantDashboardStats(merchantId?: string | null) {
  await ensureDbConnection();
  const products = merchantId
    ? await productRepository.findAll({ merchantId })
    : await productRepository.findAll();
  const productIds = products.map((p) => p._id);
  const tryOnCount = await tryOnHistoryRepository.count({ productIds });
  const perProduct = await tryOnHistoryRepository.countByProductIds(productIds);

  return {
    productCount: products.length,
    tryOnCount,
    inStockCount: products.filter((p) => p.inStock).length,
    products,
    perProduct,
  };
}

export { mongoose };
