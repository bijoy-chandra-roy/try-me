import { ensureDbConnection } from '@/server/db/connection';
import { userRepository } from '@/server/features/auth/user.repository';
import { authService } from '@/server/features/auth/auth.service';
import { tryOnHistoryRepository } from '@/server/features/try-on/try-on-history.repository';
import {
  requireAuth,
  requirePermission,
  requireAnyPermission,
} from '@/server/lib/auth-guard';
import { publishAuthEvent } from '@/server/lib/auth-events';
import { AppError } from '@/server/lib/errors';
import { jsonError, jsonSuccess } from '@/server/lib/api-response';
import { hasPermission } from '@/shared/auth/permissions';
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
    const canViewOthers = hasPermission(currentUser.role, 'view_users');

    if (!isSelf && !canViewOthers) {
      throw new AppError('Forbidden', 403);
    }

    const user = await userRepository.findById(id);
    if (!user) throw new AppError('User not found', 404);

    const canViewHistory =
      isSelf
        ? hasPermission(currentUser.role, 'view_own_try_on_history')
        : hasPermission(currentUser.role, 'view_all_try_on_history');

    const history = canViewHistory ? await tryOnHistoryRepository.findByUserId(id) : [];

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

    if (isSelf) {
      if (!hasPermission(currentUser.role, 'manage_own_profile')) {
        throw new AppError('Forbidden', 403);
      }
      const updated = await authService.updateProfile(id, {
        name: body.name,
        password: body.password,
      });
      publishAuthEvent({
        userId: id,
        type: 'user.updated',
        name: updated.name,
        role: updated.role,
        status: updated.status,
        merchantId: updated.merchantId ?? null,
      });
      return jsonSuccess(updated);
    }

    const data: {
      name?: string;
      role?: UserRole;
      status?: 'active' | 'inactive';
      merchantId?: string | null;
    } = {};

    if (body.name) data.name = body.name;
    if (body.merchantId !== undefined) data.merchantId = body.merchantId;

    const hasRoleChange = body.role && isUserRole(body.role);
    const hasStatusChange = body.status === 'active' || body.status === 'inactive';

    if (hasRoleChange) {
      await requirePermission('assign_roles');
      data.role = body.role;
    }

    if (hasStatusChange || body.name || body.merchantId !== undefined) {
      if (!hasRoleChange) {
        await requireAnyPermission('manage_users', 'assign_roles');
      }
      if (hasStatusChange) data.status = body.status;
    }

    if (!Object.keys(data).length) {
      throw new AppError('No valid fields to update', 400);
    }

    const updated = await authService.updateUserRole(currentUser.role, id, data);
    if (!updated) throw new AppError('User not found', 404);

    if (updated.status === 'inactive') {
      publishAuthEvent({
        userId: id,
        type: 'user.revoked',
        status: 'inactive',
        role: updated.role,
      });
    } else {
      publishAuthEvent({
        userId: id,
        type: 'user.updated',
        name: updated.name,
        role: updated.role,
        status: updated.status,
        merchantId: updated.merchantId ?? null,
      });
    }

    return jsonSuccess(updated);
  } catch (error) {
    return jsonError(error);
  }
}
