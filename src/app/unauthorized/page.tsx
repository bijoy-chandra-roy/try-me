'use client';

import Link from '@/shared/components/Link';
import { GlassCard } from '@/shared/components/GlassCard';
import { Button } from '@/shared/components/Button';
import { useAuth } from '@/shared/hooks/useAuth';
import { getDashboardPath } from '@/shared/auth/roles';

export default function UnauthorizedPage() {
  const { role } = useAuth();
  const dashboardHref = role ? getDashboardPath(role) : '/dashboard';

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg items-center px-6 py-16">
      <GlassCard className="w-full p-8 text-center">
        <h1 className="font-serif text-3xl font-semibold text-primary">
          Access denied
        </h1>
        <p className="mt-3 text-muted">
          Your role does not have permission to view that dashboard section.
          Return to your assigned dashboard or the catalog.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href={dashboardHref}>
            <Button>My dashboard</Button>
          </Link>
          <Link href="/">
            <Button>Catalog</Button>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
