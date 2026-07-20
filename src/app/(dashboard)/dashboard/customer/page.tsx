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
  const { user, update } = useAuth();
  const [history, setHistory] = useState<TryOnHistory[]>([]);
  const [orderCount, setOrderCount] = useState(0);
  const [name, setName] = useState(user?.name ?? '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

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

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    setMessage('');
    try {
      await apiClient(`/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password: password || undefined }),
      });
      setPassword('');
      setMessage('Profile updated');
      await update();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardShell
      title="Customer Dashboard"
      description="Orders, addresses, try-on history, and account settings"
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

      <div className="mb-10 grid gap-6 lg:grid-cols-2">
        <RoleGate permission="manage_own_profile">
          <div id="profile" className="scroll-mt-24">
            <GlassCard className="p-6">
              <h2 className="font-serif text-xl font-semibold">Profile</h2>
              <form onSubmit={saveProfile} className="mt-4 space-y-4">
                <div>
                  <label className="mb-1 block text-sm">Display name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-glass w-full rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm">New password (optional)</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-glass w-full rounded-xl px-3 py-2"
                  />
                </div>
                {message && <p className="text-sm text-success">{message}</p>}
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save profile'}
                </Button>
              </form>
            </GlassCard>
          </div>
        </RoleGate>

        <GlassCard className="p-6">
          <h2 className="font-serif text-xl font-semibold">Quick actions</h2>
          <p className="mt-2 text-sm text-muted">
            Browse the catalog, add to cart, or try on new products.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/">
              <Button>Browse catalog</Button>
            </Link>
            <Link href="/cart">
              <Button>View cart</Button>
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
