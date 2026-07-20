import { ensureDbConnection } from '@/server/db/connection';
import { systemConfigService } from '@/server/features/system/system-config.service';
import { requirePermission } from '@/server/lib/auth-guard';
import { jsonError, jsonSuccess } from '@/server/lib/api-response';

export async function GET() {
  try {
    await requirePermission('manage_system');
    await ensureDbConnection();
    const config = await systemConfigService.getConfig();
    return jsonSuccess(config);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    await requirePermission('manage_system');
    await ensureDbConnection();

    const body = await request.json();
    const config = await systemConfigService.updateConfig({
      maintenanceMode: body.maintenanceMode,
      guestTryOnLimit: body.guestTryOnLimit,
    });

    return jsonSuccess(config);
  } catch (error) {
    return jsonError(error);
  }
}
