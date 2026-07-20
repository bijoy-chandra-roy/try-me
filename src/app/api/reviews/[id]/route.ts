import { ensureDbConnection } from '@/server/db/connection';
import { reviewService } from '@/server/features/reviews/review.service';
import { requirePermission } from '@/server/lib/auth-guard';
import { jsonError, jsonSuccess } from '@/server/lib/api-response';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await ensureDbConnection();
    const user = await requirePermission('manage_reviews');
    const { id } = await context.params;
    const body = await request.json();
    const review = await reviewService.update(user, id, body);
    return jsonSuccess(review);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await ensureDbConnection();
    const user = await requirePermission('manage_reviews');
    const { id } = await context.params;
    await reviewService.remove(user, id);
    return jsonSuccess({ deleted: true });
  } catch (error) {
    return jsonError(error);
  }
}
