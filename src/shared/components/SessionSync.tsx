'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { canAccessDashboardPath } from '@/shared/auth/permissions';
import { getDashboardPath, isUserRole } from '@/shared/auth/roles';

export function SessionSync() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const role = session?.user?.role;
    if (!role || !isUserRole(role)) return;
    if (!pathname.startsWith('/dashboard')) return;

    if (!canAccessDashboardPath(role, pathname)) {
      router.replace(getDashboardPath(role));
    }
  }, [session?.user?.role, pathname, router]);

  return null;
}
