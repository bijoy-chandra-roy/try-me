import { ensureDbConnection } from '@/server/db/connection';
import { reviewService } from '@/server/features/reviews/review.service';
import { requirePermission } from '@/server/lib/auth-guard';
import { jsonError, jsonSuccess } from '@/server/lib/api-response';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    await ensureDbConnection();
    const { id } = await context.params;
    const reviews = await reviewService.listByProduct(id);
    return jsonSuccess(reviews);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    await ensureDbConnection();
    const user = await requirePermission('manage_reviews');
    const { id } = await context.params;
    const body = await request.json();
    const review = await reviewService.create(user, id, body);
    return jsonSuccess(review, 201);
  } catch (error) {
    return jsonError(error);
  }
}
