import { ensureDbConnection } from '@/server/db/connection';
import { getDashboardStats } from '@/server/features/dashboard/dashboard.service';
import { requirePermission } from '@/server/lib/auth-guard';
import { jsonError, jsonSuccess } from '@/server/lib/api-response';

export async function GET() {
  try {
    await requirePermission('view_system_health');
    await ensureDbConnection();
    const stats = await getDashboardStats();
    return jsonSuccess(stats);
  } catch (error) {
    return jsonError(error);
  }
}
