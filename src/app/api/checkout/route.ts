import { ensureDbConnection } from '@/server/db/connection';
import { orderService } from '@/server/features/orders/order.service';
import { productRepository } from '@/server/features/products/product.repository';
import { requirePermission } from '@/server/lib/auth-guard';
import { jsonError, jsonSuccess } from '@/server/lib/api-response';

export async function POST(request: Request) {
  try {
    await ensureDbConnection();
    await productRepository.migrateStockQuantities();
    const user = await requirePermission('place_orders');
    const body = await request.json();
    const order = await orderService.checkout(user, body);
    return jsonSuccess(order, 201);
  } catch (error) {
    return jsonError(error);
  }
}
