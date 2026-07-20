import { ensureDbConnection } from '@/server/db/connection';
import { addressService } from '@/server/features/addresses/address.service';
import { requirePermission } from '@/server/lib/auth-guard';
import { jsonError, jsonSuccess } from '@/server/lib/api-response';

export async function GET() {
  try {
    await ensureDbConnection();
    const user = await requirePermission('manage_cart');
    const addresses = await addressService.list(user.id);
    return jsonSuccess(
      addresses.map((a) => ({
        ...a,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      }))
    );
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    await ensureDbConnection();
    const user = await requirePermission('manage_cart');
    const body = await request.json();
    const address = await addressService.create(user.id, body);
    return jsonSuccess(
      {
        ...address,
        createdAt: address.createdAt.toISOString(),
        updatedAt: address.updatedAt.toISOString(),
      },
      201
    );
  } catch (error) {
    return jsonError(error);
  }
}
