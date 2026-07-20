'use client';

import Link from '@/shared/components/Link';
import { GlassCard } from '@/shared/components/GlassCard';
import { Button } from '@/shared/components/Button';
import { useAuth } from '@/shared/hooks/useAuth';
import { getDashboardPath } from '@/shared/auth/roles';
import { useT } from '@/shared/hooks/useT';

export default function UnauthorizedPage() {
  const { role } = useAuth();
  const t = useT();
  const dashboardHref = role ? getDashboardPath(role) : '/dashboard';

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg items-center px-6 py-16">
      <GlassCard className="w-full p-8 text-center">
        <h1 className="font-serif text-3xl font-semibold text-primary">
          {t('unauthorized.title')}
        </h1>
        <p className="mt-3 text-muted">{t('unauthorized.body')}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href={dashboardHref}>
            <Button>{t('unauthorized.myDashboard')}</Button>
          </Link>
          <Link href="/">
            <Button>{t('unauthorized.catalog')}</Button>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
