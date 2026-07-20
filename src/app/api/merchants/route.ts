import { ensureDbConnection } from '@/server/db/connection';
import { merchantService } from '@/server/features/merchants/merchant.service';
import { userRepository } from '@/server/features/auth/user.repository';
import { requirePermission, requireAuth } from '@/server/lib/auth-guard';
import { AppError } from '@/server/lib/errors';
import { jsonError, jsonSuccess } from '@/server/lib/api-response';
import { hasPermission } from '@/shared/auth/permissions';

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

    if (!hasPermission(user.role, 'manage_merchants')) {
      throw new AppError('Forbidden', 403);
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name) throw new AppError('Merchant name is required', 400);

    let ownerId: string;

    if (user.role === 'merchant') {
      ownerId = user.id;
    } else if (hasPermission(user.role, 'manage_users')) {
      ownerId = body.ownerId;
      if (!ownerId) throw new AppError('ownerId is required', 400);
    } else {
      throw new AppError('Forbidden', 403);
    }

    const merchant = await merchantService.createMerchant({
      name,
      description: description ?? '',
      ownerId,
      status: user.role === 'merchant' ? 'pending' : 'approved',
    });

    await userRepository.update(ownerId, { merchantId: merchant._id });

    return jsonSuccess(merchant, 201);
  } catch (error) {
    return jsonError(error);
  }
}
