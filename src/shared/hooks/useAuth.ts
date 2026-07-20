'use client';

import { useSession } from 'next-auth/react';
import { isUserRole } from '@/shared/auth/roles';
import type { UserRole } from '@/shared/auth/roles';
import { getPermissionsForRole, hasPermission, type Permission } from '@/shared/auth/permissions';

export function useAuth() {
  const { data: session, status, update } = useSession();
  const rawRole = session?.user?.role;
  const role = rawRole && isUserRole(rawRole) ? rawRole : undefined;

  return {
    user: session?.user ?? null,
    role,
    permissions: role ? getPermissionsForRole(role) : [],
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    update,
  };
}

export function usePermission(permission: Permission): boolean {
  const { role } = useAuth();
  if (!role) return false;
  return hasPermission(role, permission);
}

export function usePermissions(): Permission[] {
  const { role } = useAuth();
  if (!role) return [];
  return getPermissionsForRole(role);
}
