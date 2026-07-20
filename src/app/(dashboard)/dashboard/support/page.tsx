'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/features/dashboard/components/DashboardShell';
import { GlassCard } from '@/shared/components/GlassCard';
import { GlassButton } from '@/shared/components/GlassButton';
import { RoleGate } from '@/shared/components/RoleGate';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { apiClient } from '@/shared/lib/api-client';
import { ROLE_LABELS } from '@/shared/auth/roles';
import type { DashboardStats, TryOnHistory, User } from '@/shared/types';

interface UserDetail {
  user: User;
  history: TryOnHistory[];
}

export default function SupportDashboardPage() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState<UserDetail | null>(null);
  const [health, setHealth] = useState<string>('—');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      apiClient<{ status: string }>('/health').then((h) => setHealth(h.status)).catch(() => setHealth('unavailable')),
      apiClient<DashboardStats>('/dashboard/stats').then(setStats).catch(() => setStats(null)),
    ]);
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSelected(null);
    try {
      const results = await apiClient<User[]>(`/users?search=${encodeURIComponent(search)}`);
      setUsers(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }

  async function viewUser(userId: string) {
    setLoading(true);
    try {
      const detail = await apiClient<UserDetail>(`/users/${userId}`);
      setSelected(detail);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardShell
      title="Support Dashboard"
      description="Look up customers, assist with try-on sessions, and monitor platform health"
    >
      <RoleGate permission="view_system_health">
        <section id="health" className="mb-8 scroll-mt-24">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="System status" value={health} />
            {stats && (
              <>
                <StatCard label="Total users" value={stats.totalUsers} />
                <StatCard label="Total try-ons" value={stats.totalTryOns} />
                <StatCard label="Total products" value={stats.totalProducts} />
              </>
            )}
          </div>
        </section>
      </RoleGate>

      <RoleGate permission="view_users">
        <GlassCard className="mb-6 p-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="input-glass min-w-0 flex-1 rounded-xl px-4 py-2"
            />
            <GlassButton type="submit" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </GlassButton>
          </form>
          {error && <p className="mt-3 text-sm text-error">{error}</p>}
        </GlassCard>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="mb-3 font-serif text-lg font-semibold">Results</h2>
            <div className="space-y-2">
              {users.map((user) => (
                <GlassCard
                  key={user._id}
                  className="flex cursor-pointer items-center justify-between p-4 hover:bg-sand-100/30 dark:hover:bg-olive-600/10"
                  hover
                >
                  <div onClick={() => viewUser(user._id)}>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-subtle">{user.email}</p>
                  </div>
                  <span className="chip-category">{ROLE_LABELS[user.role]}</span>
                </GlassCard>
              ))}
              {!loading && users.length === 0 && (
                <p className="text-sm text-muted-subtle">Search for a user to begin.</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="mb-3 font-serif text-lg font-semibold">User detail</h2>
            {selected ? (
              <GlassCard className="p-6">
                <p className="font-medium">{selected.user.name}</p>
                <p className="text-sm text-muted-subtle">{selected.user.email}</p>
                <p className="mt-1 text-sm">
                  Status: {selected.user.status} · Role: {ROLE_LABELS[selected.user.role]}
                </p>
                <RoleGate permission="view_all_try_on_history">
                  <h3 className="mt-6 mb-3 text-sm font-medium uppercase tracking-wider text-muted-subtle">
                    Try-on history ({selected.history.length})
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {selected.history.map((item) => (
                      <div key={item._id} className="overflow-hidden rounded-xl border border-subtle">
                        <img src={item.compositeImageUrl} alt={item.productName} className="aspect-square object-cover" />
                        <p className="p-2 text-xs">{item.productName}</p>
                      </div>
                    ))}
                  </div>
                </RoleGate>
              </GlassCard>
            ) : (
              <GlassCard className="p-6 text-sm text-muted-subtle">
                Select a user to view their try-on history.
              </GlassCard>
            )}
          </div>
        </div>
      </RoleGate>
    </DashboardShell>
  );
}
