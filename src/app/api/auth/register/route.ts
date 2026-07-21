import { ensureDbConnection } from '@/server/db/connection';
import { authService } from '@/server/features/auth/auth.service';
import { checkRateLimit } from '@/server/lib/rate-limit';
import { AppError } from '@/server/lib/errors';
import { jsonError, jsonSuccess } from '@/server/lib/api-response';

const REGISTER_WINDOW_MS = 60 * 60 * 1000;
const REGISTER_LIMIT = 10;

export async function POST(request: Request) {
  try {
    await ensureDbConnection();

    const ip =
      request.headers.get('cf-connecting-ip')?.trim() ||
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      'local';
    const { allowed } = checkRateLimit(`register:${ip}`, REGISTER_LIMIT, REGISTER_WINDOW_MS);
    if (!allowed) {
      throw new AppError('Too many registration attempts. Please try again later.', 429);
    }

    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return jsonError(new Error('Email, password, and name are required'));
    }

    const user = await authService.register({ email, password, name });
    return jsonSuccess(user, 201);
  } catch (error) {
    return jsonError(error);
  }
}
