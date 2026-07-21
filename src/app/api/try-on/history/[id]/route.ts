import { ensureDbConnection } from '@/server/db/connection';
import { tryOnHistoryService } from '@/server/features/try-on/try-on-history.service';
import { requirePermission } from '@/server/lib/auth-guard';
import { jsonError, jsonSuccess } from '@/server/lib/api-response';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await ensureDbConnection();
    const user = await requirePermission('view_own_try_on_history');
    const { id } = await context.params;
    await tryOnHistoryService.remove(user.id, id);
    return jsonSuccess({ deleted: true });
  } catch (error) {
    return jsonError(error);
  }
}
