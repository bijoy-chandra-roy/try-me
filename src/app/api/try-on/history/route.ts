import type { NextRequest } from 'next/server';
import { ensureDbConnection } from '@/server/db/connection';
import { tryOnHistoryService } from '@/server/features/try-on/try-on-history.service';
import { requireAuth, requirePermission } from '@/server/lib/auth-guard';
import { jsonError, jsonSuccess } from '@/server/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    await ensureDbConnection();

    const userIdParam = request.nextUrl.searchParams.get('userId');

    if (userIdParam) {
      await requirePermission('view_all_try_on_history');
      const history = await tryOnHistoryService.getUserHistory(userIdParam);
      return jsonSuccess(history);
    }

    if (user.role === 'support' || user.role === 'admin' || user.role === 'super_admin') {
      await requirePermission('view_all_try_on_history');
      const history = await tryOnHistoryService.getAllHistory();
      return jsonSuccess(history);
    }

    const history = await tryOnHistoryService.getUserHistory(user.id);
    return jsonSuccess(history);
  } catch (error) {
    return jsonError(error);
  }
}
