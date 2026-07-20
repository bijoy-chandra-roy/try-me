'use client';

import type { ReactNode } from 'react';
import { useAuth, usePermission } from '@/shared/hooks/useAuth';
import type { Permission } from '@/shared/auth/permissions';
import { Skeleton } from '@/shared/components/Skeleton';

interface RoleGateProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
  /** Shown while auth is still resolving. Defaults to a reserved skeleton block. */
  loadingFallback?: ReactNode;
}

export function RoleGate({
  permission,
  children,
  fallback = null,
  loadingFallback = <Skeleton className="h-32 w-full" />,
}: RoleGateProps) {
  const { isResolved } = useAuth();
  const allowed = usePermission(permission);

  if (!isResolved) {
    return <>{loadingFallback}</>;
  }

  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}
