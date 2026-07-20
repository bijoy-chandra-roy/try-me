import type { NextRequest } from 'next/server';
import { ensureDbConnection } from '@/server/db/connection';
import { orderService } from '@/server/features/orders/order.service';
import { userRepository } from '@/server/features/auth/user.repository';
import { requireAnyPermission } from '@/server/lib/auth-guard';
import { jsonError, jsonSuccess } from '@/server/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    await ensureDbConnection();
    const user = await requireAnyPermission(
      'view_own_orders',
      'view_all_orders',
      'fulfill_orders'
    );

    const { searchParams } = request.nextUrl;
    const orderNumber = searchParams.get('orderNumber') || undefined;
    let userId = searchParams.get('userId') || undefined;
    const email = searchParams.get('email');

    if (email && !userId) {
      const found = await userRepository.findByEmail(email);
      if (found) userId = String(found._id);
    }

    const orders = await orderService.listForUser(user, { orderNumber, userId });
    return jsonSuccess(orders);
  } catch (error) {
    return jsonError(error);
  }
}
