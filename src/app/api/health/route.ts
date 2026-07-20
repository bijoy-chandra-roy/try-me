import { ensureDbConnection } from '@/server/db/connection';
import { requirePermission } from '@/server/lib/auth-guard';
import { jsonError, jsonSuccess } from '@/server/lib/api-response';

export async function GET() {
  try {
    await requirePermission('view_system_health');
    await ensureDbConnection();
    return jsonSuccess({ message: 'TryMe API is running', status: 'healthy' });
  } catch (error) {
    return jsonError(error);
  }
}
