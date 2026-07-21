import { auth } from '@/auth';
import type { UserRole } from '@/shared/auth/roles';
import { isUserRole } from '@/shared/auth/roles';
import { hasPermission, type Permission } from '@/shared/auth/permissions';
import { AppError } from '@/server/lib/errors';
import { userRepository } from '@/server/features/auth/user.repository';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  realRole: UserRole;
  merchantId?: string | null;
  status?: 'active' | 'inactive';
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id || !isUserRole(session.user.role)) return null;

  const liveStatus = await userRepository.findStatusById(session.user.id);
  if (!liveStatus || liveStatus === 'inactive') return null;

  const realRole =
    session.user.realRole && isUserRole(session.user.realRole)
      ? session.user.realRole
      : session.user.role;

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
    realRole,
    merchantId: session.user.merchantId ?? null,
    status: session.user.status ?? 'active',
  };
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new AppError('Authentication required', 401);
  }
  return user;
}

export async function requirePermission(permission: Permission): Promise<SessionUser> {
  const user = await requireAuth();
  if (!hasPermission(user.role, permission)) {
    throw new AppError('Forbidden', 403);
  }
  return user;
}

export async function requireAnyPermission(...permissions: Permission[]): Promise<SessionUser> {
  const user = await requireAuth();
  if (!permissions.some((p) => hasPermission(user.role, p))) {
    throw new AppError('Forbidden', 403);
  }
  return user;
}

export async function requireRole(...roles: UserRole[]): Promise<SessionUser> {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    throw new AppError('Forbidden', 403);
  }
  return user;
}

export async function getOptionalAuth(): Promise<SessionUser | null> {
  return getSessionUser();
}
