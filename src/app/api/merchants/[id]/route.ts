import { ensureDbConnection } from '@/server/db/connection';
import { merchantService } from '@/server/features/merchants/merchant.service';
import { requirePermission } from '@/server/lib/auth-guard';
import { jsonError, jsonSuccess } from '@/server/lib/api-response';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission('manage_merchants');
    await ensureDbConnection();

    const { id } = await params;
    const body = await request.json();

    const merchant = await merchantService.updateMerchant(id, {
      name: body.name,
      description: body.description,
      status: body.status,
    });

    return jsonSuccess(merchant);
  } catch (error) {
    return jsonError(error);
  }
}
