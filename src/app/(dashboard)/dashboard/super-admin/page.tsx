'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/features/dashboard/components/DashboardShell';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { GlassCard } from '@/shared/components/GlassCard';
import { GlassButton } from '@/shared/components/GlassButton';
import { apiClient } from '@/shared/lib/api-client';
import { ROLE_LABELS, USER_ROLES } from '@/shared/auth/roles';
import type { DashboardStats, User, UserRole } from '@/shared/types';

export default function SuperAdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [flags, setFlags] = useState({ maintenanceMode: false, guestTryOnLimit: 3 });
  const [message, setMessage] = useState('');

  async function loadAll() {
    const [statsData, usersData] = await Promise.all([
      apiClient<DashboardStats>('/dashboard/stats'),
      apiClient<User[]>('/users'),
    ]);
    setStats(statsData);
    setUsers(usersData);
  }

  useEffect(() => {
    loadAll().catch(() => setMessage('Failed to load system data'));
  }, []);

  async function changeRole(userId: string, role: UserRole) {
    try {
      await apiClient(`/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      setMessage(`Role updated to ${ROLE_LABELS[role]}`);
      await loadAll();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Role update failed');
    }
  }

  return (
    <DashboardShell
      title="Super Admin Dashboard"
      description="Full system control, role assignment, and configuration"
    >
      {stats && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Users" value={stats.totalUsers} />
          <StatCard label="Products" value={stats.totalProducts} />
          <StatCard label="Merchants" value={stats.totalMerchants} />
          <StatCard label="Try-ons" value={stats.totalTryOns} />
        </div>
      )}

      <div className="mb-10 grid gap-6 lg:grid-cols-2">
        <GlassCard className="p-6">
          <h2 className="font-serif text-xl font-semibold">Feature flags</h2>
          <p className="mt-1 text-sm text-sand-500">Local session flags for system behavior</p>
          <div className="mt-4 space-y-3">
            <label className="flex items-center justify-between text-sm">
              Maintenance mode
              <input
                type="checkbox"
                checked={flags.maintenanceMode}
                onChange={(e) => setFlags({ ...flags, maintenanceMode: e.target.checked })}
              />
            </label>
            <label className="flex items-center justify-between text-sm">
              Guest try-on limit
              <input
                type="number"
                min={1}
                max={10}
                value={flags.guestTryOnLimit}
                onChange={(e) =>
                  setFlags({ ...flags, guestTryOnLimit: Number(e.target.value) })
                }
                className="w-16 rounded border border-sand-300/60 bg-white/50 px-2 py-1 dark:border-olive-500/40 dark:bg-olive-800/30"
              />
            </label>
          </div>
          <p className="mt-4 text-xs text-sand-500">
            Flags are stored locally in this session. Wire to server config in production.
          </p>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="font-serif text-xl font-semibold">Recent try-ons</h2>
          <div className="mt-4 max-h-48 space-y-2 overflow-y-auto">
            {stats?.recentTryOns.map((item) => (
              <div key={item._id} className="text-sm">
                <span className="font-medium">{item.productName}</span>
                <span className="text-sand-500"> · {new Date(item.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {message && <p className="mb-4 text-sm text-olive-600">{message}</p>}

      <section>
        <h2 className="mb-4 font-serif text-xl font-semibold">Role assignment</h2>
        <div className="space-y-2">
          {users.map((user) => (
            <GlassCard key={user._id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-sand-500">{user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="chip-category">{ROLE_LABELS[user.role]}</span>
                <select
                  value={user.role}
                  onChange={(e) => changeRole(user._id, e.target.value as UserRole)}
                  className="rounded-lg border border-sand-300/60 bg-white/50 px-2 py-1 text-sm dark:border-olive-500/40 dark:bg-olive-800/30"
                >
                  {USER_ROLES.map((r) => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
                {user.role === 'admin' && (
                  <GlassButton
                    onClick={() =>
                      apiClient(`/users/${user._id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'inactive' }),
                      }).then(loadAll)
                    }
                  >
                    Deactivate
                  </GlassButton>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}
