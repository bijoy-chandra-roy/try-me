import { ensureDbConnection } from '@/server/db/connection';
import { systemConfigService } from '@/server/features/system/system-config.service';
import { jsonError, jsonSuccess } from '@/server/lib/api-response';

export async function GET() {
  try {
    await ensureDbConnection();
    const config = await systemConfigService.getConfig();
    return jsonSuccess({
      maintenanceMode: config.maintenanceMode,
      guestTryOnLimit: config.guestTryOnLimit,
    });
  } catch (error) {
    return jsonError(error);
  }
}
