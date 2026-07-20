'use client';

import { useSession } from 'next-auth/react';
import type { UserRole } from '@/shared/auth/roles';
import { hasPermission, type Permission } from '@/shared/auth/permissions';

export function useAuth() {
  const { data: session, status, update } = useSession();

  return {
    user: session?.user ?? null,
    role: session?.user?.role as UserRole | undefined,
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
