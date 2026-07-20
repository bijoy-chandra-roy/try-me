'use client';

import type { ReactNode } from 'react';
import { usePermission } from '@/shared/hooks/useAuth';
import type { Permission } from '@/shared/auth/permissions';

interface RoleGateProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGate({ permission, children, fallback = null }: RoleGateProps) {
  const allowed = usePermission(permission);
  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}
