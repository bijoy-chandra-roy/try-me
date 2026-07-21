import { ensureDbConnection } from '@/server/db/connection';
import { uploadService } from '@/server/features/upload/upload.service';
import { AppError } from '@/server/lib/errors';
import { assertValidImageBuffer } from '@/server/lib/validate-image';
import { requireAuth } from '@/server/lib/auth-guard';
import { jsonError, jsonSuccess } from '@/server/lib/api-response';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    await ensureDbConnection();
    await requireAuth();

    const formData = await request.formData();
    const image = formData.get('image');

    if (!(image instanceof File)) {
      throw new AppError('Image file is required', 400);
    }

    if (!image.type.startsWith('image/')) {
      throw new AppError('File must be an image', 400);
    }

    if (image.size > MAX_FILE_SIZE) {
      throw new AppError('Image must be under 10MB', 400);
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    assertValidImageBuffer(buffer, image.type);
    const url = await uploadService.uploadImage({
      buffer,
      originalname: image.name || 'upload.jpg',
    });

    return jsonSuccess({ url });
  } catch (error) {
    return jsonError(error);
  }
}
