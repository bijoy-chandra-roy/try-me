import mongoose from 'mongoose';
import { ensureDbConnection } from '@/server/db/connection';
import { userRepository } from '@/server/features/auth/user.repository';
import { merchantRepository } from '@/server/features/merchants/merchant.repository';
import { productRepository } from '@/server/features/products/product.repository';
import { tryOnHistoryRepository } from '@/server/features/try-on/try-on-history.repository';
import { orderRepository } from '@/server/features/orders/order.repository';
import type { DashboardStats } from '@/shared/types';

export async function getDashboardStats(): Promise<DashboardStats> {
  await ensureDbConnection();
  await productRepository.migrateStockQuantities();

  const [
    totalUsers,
    totalProducts,
    totalMerchants,
    totalTryOns,
    totalOrders,
    totalRevenue,
    recentTryOns,
  ] = await Promise.all([
    userRepository.count(),
    productRepository.count(),
    merchantRepository.count(),
    tryOnHistoryRepository.count(),
    orderRepository.count(),
    orderRepository.sumRevenue(),
    tryOnHistoryRepository.findAll(10),
  ]);

  return {
    totalUsers,
    totalProducts,
    totalMerchants,
    totalTryOns,
    totalOrders,
    totalRevenue,
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
  await productRepository.migrateStockQuantities();

  const products = merchantId
    ? await productRepository.findAll({ merchantId })
    : await productRepository.findAll();
  const productIds = products.map((p) => p._id);
  const tryOnCount = await tryOnHistoryRepository.count({ productIds });
  const perProduct = await tryOnHistoryRepository.countByProductIds(productIds);

  const orderCount = merchantId
    ? await orderRepository.countByMerchant(merchantId)
    : await orderRepository.count();
  const unitsSold = merchantId
    ? await orderRepository.unitsSoldByMerchant(merchantId)
    : 0;

  return {
    productCount: products.length,
    tryOnCount,
    inStockCount: products.filter((p) => p.inStock).length,
    lowStockCount: products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= 5).length,
    orderCount,
    unitsSold,
    products,
    perProduct,
  };
}

export { mongoose };
