import { ensureDbConnection } from '@/server/db/connection';
import { tryOnService } from '@/server/features/try-on/try-on.service';
import { tryOnHistoryService } from '@/server/features/try-on/try-on-history.service';
import { AppError } from '@/server/lib/errors';
import { getOptionalAuth } from '@/server/lib/auth-guard';
import { checkGuestTryOnLimit, getGuestIdentifier } from '@/server/lib/guest-rate-limit';
import { hasPermission } from '@/shared/auth/permissions';
import { jsonError, jsonSuccess } from '@/server/lib/api-response';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    await ensureDbConnection();

    const user = await getOptionalAuth();

    if (!user) {
      const guestId = getGuestIdentifier(request);
      const { allowed } = checkGuestTryOnLimit(guestId);
      if (!allowed) {
        throw new AppError('Guest try-on limit reached. Please sign in to continue.', 429);
      }
    } else if (!hasPermission(user.role, 'try_on')) {
      throw new AppError('Forbidden', 403);
    }

    const formData = await request.formData();
    const userImage = formData.get('userImage');
    const productId = formData.get('productId');

    if (!(userImage instanceof File)) {
      throw new AppError('User image is required', 400);
    }

    if (typeof productId !== 'string' || !productId) {
      throw new AppError('productId is required', 400);
    }

    if (!userImage.type.startsWith('image/')) {
      throw new AppError('File must be an image', 400);
    }

    if (userImage.size > MAX_FILE_SIZE) {
      throw new AppError('Image must be under 10MB', 400);
    }

    const buffer = Buffer.from(await userImage.arrayBuffer());
    const result = await tryOnService.processTryOn({
      file: { buffer, originalname: userImage.name },
      productId,
    });

    if (user) {
      await tryOnHistoryService.saveHistory(user.id, productId, result);
    }

    return jsonSuccess(result);
  } catch (error) {
    return jsonError(error);
  }
}
