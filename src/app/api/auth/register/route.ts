import { ensureDbConnection } from '@/server/db/connection';
import { authService } from '@/server/features/auth/auth.service';
import { jsonError, jsonSuccess } from '@/server/lib/api-response';

export async function POST(request: Request) {
  try {
    await ensureDbConnection();

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
