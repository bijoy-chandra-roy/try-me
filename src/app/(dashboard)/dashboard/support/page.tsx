'use client';

import { useState } from 'react';
import { DashboardShell } from '@/features/dashboard/components/DashboardShell';
import { GlassCard } from '@/shared/components/GlassCard';
import { GlassButton } from '@/shared/components/GlassButton';
import { apiClient } from '@/shared/lib/api-client';
import { ROLE_LABELS } from '@/shared/auth/roles';
import type { TryOnHistory, User } from '@/shared/types';

interface UserDetail {
  user: User;
  history: TryOnHistory[];
}

export default function SupportDashboardPage() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      description="Look up customers and assist with try-on sessions"
    >
      <GlassCard className="mb-6 p-6">
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="min-w-0 flex-1 rounded-xl border border-sand-300/60 bg-white/50 px-4 py-2 text-sm dark:border-olive-500/40 dark:bg-olive-800/30"
          />
          <GlassButton type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </GlassButton>
        </form>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
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
                  <p className="text-sm text-sand-500">{user.email}</p>
                </div>
                <span className="chip-category">{ROLE_LABELS[user.role]}</span>
              </GlassCard>
            ))}
            {!loading && users.length === 0 && (
              <p className="text-sm text-sand-500">Search for a user to begin.</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-3 font-serif text-lg font-semibold">User detail</h2>
          {selected ? (
            <GlassCard className="p-6">
              <p className="font-medium">{selected.user.name}</p>
              <p className="text-sm text-sand-500">{selected.user.email}</p>
              <p className="mt-1 text-sm">
                Status: {selected.user.status} · Role: {ROLE_LABELS[selected.user.role]}
              </p>
              <h3 className="mt-6 mb-3 text-sm font-medium uppercase tracking-wider text-sand-500">
                Try-on history ({selected.history.length})
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {selected.history.map((item) => (
                  <div key={item._id} className="overflow-hidden rounded-xl border border-sand-300/40">
                    <img src={item.compositeImageUrl} alt={item.productName} className="aspect-square object-cover" />
                    <p className="p-2 text-xs">{item.productName}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="p-6 text-sm text-sand-500">
              Select a user to view their try-on history.
            </GlassCard>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
