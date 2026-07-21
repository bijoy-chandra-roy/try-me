'use client';

import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import Link from '@/shared/components/Link';
import { DashboardShell } from '@/features/dashboard/components/DashboardShell';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { GlassCard } from '@/shared/components/GlassCard';
import { Button } from '@/shared/components/Button';
import { RoleGate } from '@/shared/components/RoleGate';
import { OrdersPanel } from '@/features/orders/components/OrdersPanel';
import { AddressesPanel } from '@/features/addresses/components/AddressesPanel';
import { useAuth } from '@/shared/hooks/useAuth';
import { useT } from '@/shared/hooks/useT';
import { apiClient, ApiError } from '@/shared/lib/api-client';
import { fetchOrders } from '@/features/orders/api/orders.api';
import { deleteTryOnHistory } from '@/features/try-on/api/try-on.api';
import { ProductCardSkeleton, StatCardsSkeleton } from '@/shared/components/Skeleton';
import type { TryOnHistory } from '@/shared/types';

export default function CustomerDashboardPage() {
  const t = useT();
  const { user } = useAuth();
  const [history, setHistory] = useState<TryOnHistory[]>([]);
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    Promise.all([
      apiClient<TryOnHistory[]>('/try-on/history').catch(() => [] as TryOnHistory[]),
      fetchOrders().catch(() => []),
    ])
      .then(([h, orders]) => {
        setHistory(h);
        setOrderCount(orders.length);
      })
      .finally(() => setLoading(false));
  }, []);

  async function removeHistory(id: string) {
    if (!window.confirm(t('dashboard.customer.historyDeleteConfirm'))) return;
    setDeletingId(id);
    setDeleteError('');
    try {
      await deleteTryOnHistory(id);
      setHistory((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      setDeleteError(
        err instanceof ApiError ? err.message : t('dashboard.customer.historyDeleteFailed')
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <DashboardShell
      title={t('dashboard.customer.title')}
      description={t('dashboard.customer.description')}
    >
      {loading ? (
        <StatCardsSkeleton count={3} className="mb-8 grid gap-4 sm:grid-cols-3" />
      ) : (
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatCard label={t('dashboard.customer.statOrders')} value={orderCount} />
          <StatCard label={t('dashboard.customer.statTryOns')} value={history.length} />
          <StatCard
            label={t('dashboard.customer.statAccount')}
            value={user?.email ?? '—'}
            hint={t('dashboard.customer.signedIn')}
          />
        </div>
      )}

      <div className="mb-10">
        <RoleGate permission="view_own_orders">
          <OrdersPanel mode="own" allowCancel />
        </RoleGate>
      </div>

      <div className="mb-10">
        <RoleGate permission="manage_cart">
          <AddressesPanel />
        </RoleGate>
      </div>

      <div className="mb-10">
        <GlassCard className="p-6">
          <h2 className="font-serif text-xl font-semibold">
            {t('dashboard.customer.quickActions')}
          </h2>
          <p className="mt-2 text-sm text-muted">
            {t('dashboard.customer.quickActionsBody')}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/">
              <Button>{t('dashboard.customer.browse')}</Button>
            </Link>
            <Link href="/cart">
              <Button variant="secondary">{t('dashboard.customer.viewCart')}</Button>
            </Link>
            <Link href="/settings/profile">
              <Button variant="ghost">{t('dashboard.customer.settings')}</Button>
            </Link>
          </div>
        </GlassCard>
      </div>

      <RoleGate permission="view_own_try_on_history">
        <section id="history" className="scroll-mt-24">
          <h2 className="mb-4 font-serif text-xl font-semibold">
            {t('dashboard.customer.historyTitle')}
          </h2>
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }, (_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : history.length === 0 ? (
            <GlassCard className="p-6 text-sm text-muted">
              {t('dashboard.customer.historyEmpty')}
            </GlassCard>
          ) : (
            <>
              {deleteError && (
                <p className="mb-3 text-sm text-error" role="alert">
                  {deleteError}
                </p>
              )}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {history.map((item) => (
                  <GlassCard key={item._id} className="overflow-hidden">
                    <img
                      src={item.compositeImageUrl}
                      alt={item.productName}
                      className="aspect-[3/4] w-full object-cover"
                    />
                    <div className="flex items-start justify-between gap-3 p-4">
                      <div className="min-w-0">
                        <p className="font-medium">{item.productName}</p>
                        <p className="mt-1 text-xs text-muted-subtle">
                          {new Date(item.createdAt).toLocaleString()} ·{' '}
                          {item.fromFallback ? t('tryOn.badge.fallback') : t('tryOn.badge.live')}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={deletingId === item._id}
                        onClick={() => removeHistory(item._id)}
                        aria-label={t('dashboard.customer.historyDelete')}
                        className="shrink-0 px-2"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                      </Button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </>
          )}
        </section>
      </RoleGate>
    </DashboardShell>
  );
}
