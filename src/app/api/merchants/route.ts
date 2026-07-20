import { ensureDbConnection } from '@/server/db/connection';
import { merchantService } from '@/server/features/merchants/merchant.service';
import { requirePermission, requireAuth } from '@/server/lib/auth-guard';
import { jsonError, jsonSuccess } from '@/server/lib/api-response';

export async function GET() {
  try {
    const user = await requirePermission('manage_merchants');
    await ensureDbConnection();
    const merchants = await merchantService.getMerchants();
    return jsonSuccess(merchants);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    await ensureDbConnection();

    const body = await request.json();
    const { name, description } = body;

    if (!name) return jsonError(new Error('Merchant name is required'));

    const ownerId =
      user.role === 'merchant' ? user.id : body.ownerId;

    if (!ownerId) return jsonError(new Error('ownerId is required'));

    const merchant = await merchantService.createMerchant({
      name,
      description: description ?? '',
      ownerId,
    });

    return jsonSuccess(merchant, 201);
  } catch (error) {
    return jsonError(error);
  }
}
