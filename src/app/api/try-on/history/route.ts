import type { NextRequest } from 'next/server';
import { ensureDbConnection } from '@/server/db/connection';
import { tryOnHistoryService } from '@/server/features/try-on/try-on-history.service';
import { requireAuth } from '@/server/lib/auth-guard';
import { AppError } from '@/server/lib/errors';
import { jsonError, jsonSuccess } from '@/server/lib/api-response';
import { hasPermission } from '@/shared/auth/permissions';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    await ensureDbConnection();

    const userIdParam = request.nextUrl.searchParams.get('userId');

    if (userIdParam) {
      if (!hasPermission(user.role, 'view_all_try_on_history')) {
        throw new AppError('Forbidden', 403);
      }
      const history = await tryOnHistoryService.getUserHistory(userIdParam);
      return jsonSuccess(history);
    }

    if (!hasPermission(user.role, 'view_own_try_on_history')) {
      throw new AppError('Forbidden', 403);
    }

    const history = await tryOnHistoryService.getUserHistory(user.id);
    return jsonSuccess(history);
  } catch (error) {
    return jsonError(error);
  }
}
