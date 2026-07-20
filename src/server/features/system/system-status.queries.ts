import { ensureDbConnection } from '@/server/db/connection';
import { systemConfigService } from '@/server/features/system/system-config.service';
import { unstable_cache } from '@/server/lib/cache';

export const getCachedSystemStatus = unstable_cache(
  async () => {
    await ensureDbConnection();
    const config = await systemConfigService.getConfig();
    return {
      maintenanceMode: config.maintenanceMode,
      guestTryOnLimit: config.guestTryOnLimit,
    };
  },
  ['system-status'],
  { revalidate: 60, tags: ['system-status'] }
);
