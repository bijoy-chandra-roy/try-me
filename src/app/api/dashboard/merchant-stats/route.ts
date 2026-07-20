import type { NextRequest } from 'next/server';
import { ensureDbConnection } from '@/server/db/connection';
import { getMerchantDashboardStats } from '@/server/features/dashboard/dashboard.service';
import { requirePermission } from '@/server/lib/auth-guard';
import { jsonError, jsonSuccess } from '@/server/lib/api-response';

export async function GET() {
  try {
    const user = await requirePermission('manage_products');
    await ensureDbConnection();

    if (user.role === 'merchant') {
      if (!user.merchantId) {
        return jsonSuccess({
          productCount: 0,
          tryOnCount: 0,
          inStockCount: 0,
          products: [],
          perProduct: {},
        });
      }
      const stats = await getMerchantDashboardStats(user.merchantId);
      return jsonSuccess(stats);
    }

    const stats = await getMerchantDashboardStats(null);
    return jsonSuccess(stats);
  } catch (error) {
    return jsonError(error);
  }
}
