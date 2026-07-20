'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { canAccessDashboardPath } from '@/shared/auth/permissions';
import { getDashboardPath, isUserRole } from '@/shared/auth/roles';
import { clearLastKnownAuth } from '@/shared/hooks/useAuth';
import { signOutAndClearPreferences } from '@/shared/lib/auth-actions';

export function SessionSync() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user) return;

    if (session.user.status === 'inactive') {
      clearLastKnownAuth();
      void signOutAndClearPreferences('/login?error=AccountInactive');
      return;
    }

    const role = session.user.role;
    if (!role || !isUserRole(role)) return;
    if (!pathname.startsWith('/dashboard')) return;

    if (!canAccessDashboardPath(role, pathname)) {
      router.replace(getDashboardPath(role));
    }
  }, [session?.user, status, pathname, router]);

  return null;
}
