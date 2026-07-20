import { ensureDbConnection } from '@/server/db/connection';
import { addressService } from '@/server/features/addresses/address.service';
import { requirePermission } from '@/server/lib/auth-guard';
import { jsonError, jsonSuccess } from '@/server/lib/api-response';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await ensureDbConnection();
    const user = await requirePermission('manage_cart');
    const { id } = await context.params;
    const body = await request.json();
    const address = await addressService.update(user.id, id, body);
    return jsonSuccess({
      ...address,
      createdAt: address.createdAt.toISOString(),
      updatedAt: address.updatedAt.toISOString(),
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await ensureDbConnection();
    const user = await requirePermission('manage_cart');
    const { id } = await context.params;
    await addressService.remove(user.id, id);
    return jsonSuccess({ deleted: true });
  } catch (error) {
    return jsonError(error);
  }
}
