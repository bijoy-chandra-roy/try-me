import { ensureDbConnection } from '@/server/db/connection';
import { merchantService } from '@/server/features/merchants/merchant.service';
import { requireAuth } from '@/server/lib/auth-guard';
import { AppError } from '@/server/lib/errors';
import { jsonError, jsonSuccess } from '@/server/lib/api-response';
import { hasPermission } from '@/shared/auth/permissions';

export async function GET() {
  try {
    const user = await requireAuth();
    await ensureDbConnection();

    if (!hasPermission(user.role, 'manage_merchants')) {
      throw new AppError('Forbidden', 403);
    }

    const merchant = user.merchantId
      ? await merchantService.getMerchantById(user.merchantId).catch(() => null)
      : await merchantService.getMerchantByOwnerId(user.id);

    return jsonSuccess(merchant);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAuth();
    await ensureDbConnection();

    if (!hasPermission(user.role, 'manage_merchants')) {
      throw new AppError('Forbidden', 403);
    }

    const merchant = user.merchantId
      ? await merchantService.getMerchantById(user.merchantId)
      : await merchantService.getMerchantByOwnerId(user.id);

    if (!merchant) {
      throw new AppError('Merchant profile not found', 404);
    }

    if (user.role === 'merchant' && merchant.ownerId !== user.id) {
      throw new AppError('Forbidden', 403);
    }

    const body = await request.json();
    const updated = await merchantService.updateMerchant(merchant._id, {
      name: body.name,
      description: body.description,
    });

    return jsonSuccess(updated);
  } catch (error) {
    return jsonError(error);
  }
}
