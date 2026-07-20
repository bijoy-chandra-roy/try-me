import { auth } from '@/auth';
import type { UserRole } from '@/shared/auth/roles';
import { hasPermission, type Permission } from '@/shared/auth/permissions';
import { AppError } from '@/server/lib/errors';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  merchantId?: string | null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
    merchantId: session.user.merchantId ?? null,
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
