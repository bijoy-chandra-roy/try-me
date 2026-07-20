import { ensureDbConnection } from '@/server/db/connection';
import { orderService } from '@/server/features/orders/order.service';
import { requireAnyPermission } from '@/server/lib/auth-guard';
import { jsonError, jsonSuccess } from '@/server/lib/api-response';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await ensureDbConnection();
    const user = await requireAnyPermission(
      'view_own_orders',
      'view_all_orders',
      'fulfill_orders'
    );
    const { id } = await context.params;
    const body = await request.json();
    const order = await orderService.updateStatus(user, id, body);
    return jsonSuccess(order);
  } catch (error) {
    return jsonError(error);
  }
}
