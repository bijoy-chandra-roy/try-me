'use client';

import Link from 'next/link';
import { GlassCard } from '@/shared/components/GlassCard';
import { GlassButton } from '@/shared/components/GlassButton';
import { useAuth } from '@/shared/hooks/useAuth';
import { getDashboardPath } from '@/shared/auth/roles';

export default function UnauthorizedPage() {
  const { role } = useAuth();
  const dashboardHref = role ? getDashboardPath(role) : '/dashboard';

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg items-center px-6 py-16">
      <GlassCard className="w-full p-8 text-center">
        <h1 className="font-serif text-3xl font-semibold text-olive-700 dark:text-sand-100">
          Access denied
        </h1>
        <p className="mt-3 text-sand-600 dark:text-sand-300">
          Your role does not have permission to view that dashboard section.
          Return to your assigned dashboard or the catalog.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href={dashboardHref}>
            <GlassButton>My dashboard</GlassButton>
          </Link>
          <Link href="/">
            <GlassButton>Catalog</GlassButton>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
