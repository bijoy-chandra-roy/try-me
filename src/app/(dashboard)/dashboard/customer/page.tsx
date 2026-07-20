'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/features/dashboard/components/DashboardShell';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { GlassCard } from '@/shared/components/GlassCard';
import { Button } from '@/shared/components/Button';
import { RoleGate } from '@/shared/components/RoleGate';
import { OrdersPanel } from '@/features/orders/components/OrdersPanel';
import { AddressesPanel } from '@/features/addresses/components/AddressesPanel';
import { useAuth } from '@/shared/hooks/useAuth';
import { apiClient } from '@/shared/lib/api-client';
import { fetchOrders } from '@/features/orders/api/orders.api';
import type { TryOnHistory } from '@/shared/types';

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<TryOnHistory[]>([]);
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);

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

  return (
    <DashboardShell
      title="Customer Dashboard"
      description="Orders, addresses, and try-on history"
    >
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Orders" value={orderCount} />
        <StatCard label="Try-ons saved" value={history.length} />
        <StatCard label="Account" value={user?.email ?? '—'} hint="Signed in" />
      </div>

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
          <h2 className="font-serif text-xl font-semibold">Quick actions</h2>
          <p className="mt-2 text-sm text-muted">
            Browse the catalog, manage your cart, or update account settings.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/">
              <Button>Browse catalog</Button>
            </Link>
            <Link href="/cart">
              <Button variant="secondary">View cart</Button>
            </Link>
            <Link href="/dashboard/settings/profile">
              <Button variant="ghost">Settings</Button>
            </Link>
          </div>
        </GlassCard>
      </div>

      <RoleGate permission="view_own_try_on_history">
        <section id="history" className="scroll-mt-24">
          <h2 className="mb-4 font-serif text-xl font-semibold">Try-on history</h2>
          {loading && <p className="text-sm text-muted-subtle">Loading history...</p>}
          {!loading && history.length === 0 && (
            <GlassCard className="p-6 text-sm text-muted">
              No try-ons yet. Head to the catalog to get started.
            </GlassCard>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {history.map((item) => (
              <GlassCard key={item._id} className="overflow-hidden">
                <img
                  src={item.compositeImageUrl}
                  alt={item.productName}
                  className="aspect-[3/4] w-full object-cover"
                />
                <div className="p-4">
                  <p className="font-medium">{item.productName}</p>
                  <p className="mt-1 text-xs text-muted-subtle">
                    {new Date(item.createdAt).toLocaleString()} ·{' '}
                    {item.fromFallback ? 'Fallback' : 'Live'}
                  </p>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>
      </RoleGate>
    </DashboardShell>
  );
}
