import { ensureDbConnection } from '@/server/db/connection';
import { userRepository } from '@/server/features/auth/user.repository';
import { authService } from '@/server/features/auth/auth.service';
import { tryOnHistoryRepository } from '@/server/features/try-on/try-on-history.repository';
import { requirePermission, requireAuth } from '@/server/lib/auth-guard';
import { jsonError, jsonSuccess } from '@/server/lib/api-response';
import { isUserRole } from '@/shared/auth/roles';
import type { UserRole } from '@/shared/auth/roles';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAuth();
    const { id } = await params;
    await ensureDbConnection();

    const isSelf = currentUser.id === id;
    const canViewOthers =
      currentUser.role === 'support' ||
      currentUser.role === 'admin' ||
      currentUser.role === 'super_admin';

    if (!isSelf && !canViewOthers) {
      return jsonError(new Error('Forbidden'));
    }

    const user = await userRepository.findById(id);
    if (!user) return jsonError(new Error('User not found'));

    const history =
      canViewOthers || isSelf
        ? await tryOnHistoryRepository.findByUserId(id)
        : [];

    return jsonSuccess({ user, history });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAuth();
    const { id } = await params;
    await ensureDbConnection();

    const body = await request.json();
    const isSelf = currentUser.id === id;
    const canManage = currentUser.role === 'admin' || currentUser.role === 'super_admin';

    if (isSelf) {
      const updated = await authService.updateProfile(id, {
        name: body.name,
        password: body.password,
      });
      return jsonSuccess(updated);
    }

    if (!canManage) {
      return jsonError(new Error('Forbidden'));
    }

    const data: {
      name?: string;
      role?: UserRole;
      status?: 'active' | 'inactive';
      merchantId?: string | null;
    } = {};

    if (body.name) data.name = body.name;
    if (body.status) data.status = body.status;
    if (body.merchantId !== undefined) data.merchantId = body.merchantId;
    if (body.role && isUserRole(body.role)) data.role = body.role;

    const updated = await authService.updateUserRole(currentUser.role, id, data);
    return jsonSuccess(updated);
  } catch (error) {
    return jsonError(error);
  }
}
