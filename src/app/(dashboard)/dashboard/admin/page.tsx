'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/features/dashboard/components/DashboardShell';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { GlassCard } from '@/shared/components/GlassCard';
import { GlassButton } from '@/shared/components/GlassButton';
import { RoleGate } from '@/shared/components/RoleGate';
import { apiClient } from '@/shared/lib/api-client';
import { ROLE_LABELS, USER_ROLES } from '@/shared/auth/roles';
import type { DashboardStats, Merchant, User, UserRole } from '@/shared/types';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [health, setHealth] = useState<string>('—');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer' as UserRole,
    merchantId: '',
  });
  const [message, setMessage] = useState('');

  async function loadAll() {
    const [statsData, usersData, merchantsData] = await Promise.all([
      apiClient<DashboardStats>('/dashboard/stats'),
      apiClient<User[]>('/users'),
      apiClient<Merchant[]>('/merchants'),
    ]);
    setStats(statsData);
    setUsers(usersData);
    setMerchants(merchantsData);

    try {
      const h = await apiClient<{ status: string }>('/health');
      setHealth(h.status);
    } catch {
      setHealth('unavailable');
    }
  }

  useEffect(() => {
    loadAll().catch(() => setMessage('Failed to load admin data'));
  }, []);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    try {
      await apiClient('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newUser,
          merchantId: newUser.merchantId || null,
        }),
      });
      setNewUser({ name: '', email: '', password: '', role: 'customer', merchantId: '' });
      setMessage('User created');
      await loadAll();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Create failed');
    }
  }

  async function toggleUserStatus(user: User) {
    await apiClient(`/users/${user._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: user.status === 'active' ? 'inactive' : 'active' }),
    });
    await loadAll();
  }

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

  async function updateMerchantStatus(merchant: Merchant, status: Merchant['status']) {
    await apiClient(`/merchants/${merchant._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    await loadAll();
  }

  const assignableRoles = USER_ROLES.filter((r) => r !== 'super_admin');

  return (
    <DashboardShell
      title="Admin Dashboard"
      description="Manage users, merchants, and monitor platform health"
    >
      <RoleGate permission="view_system_health">
        {stats && (
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Users" value={stats.totalUsers} />
            <StatCard label="Products" value={stats.totalProducts} />
            <StatCard label="Merchants" value={stats.totalMerchants} />
            <StatCard label="Try-ons" value={stats.totalTryOns} />
          </div>
        )}

        <GlassCard className="mb-8 p-6">
          <h2 className="font-serif text-xl font-semibold">System health</h2>
          <p className="mt-2 text-3xl font-semibold capitalize">{health}</p>
        </GlassCard>
      </RoleGate>

      <RoleGate permission="manage_users">
        <GlassCard className="mb-8 p-6">
          <h2 className="font-serif text-xl font-semibold">Create user</h2>
          <form onSubmit={createUser} className="mt-4 space-y-3">
            <input
              placeholder="Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              required
              className="w-full rounded-lg border border-sand-300/60 bg-white/50 px-3 py-2 text-sm dark:border-olive-500/40 dark:bg-olive-800/30"
            />
            <input
              placeholder="Email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              required
              className="w-full rounded-lg border border-sand-300/60 bg-white/50 px-3 py-2 text-sm dark:border-olive-500/40 dark:bg-olive-800/30"
            />
            <input
              placeholder="Password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              required
              className="w-full rounded-lg border border-sand-300/60 bg-white/50 px-3 py-2 text-sm dark:border-olive-500/40 dark:bg-olive-800/30"
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
              className="w-full rounded-lg border border-sand-300/60 bg-white/50 px-3 py-2 text-sm dark:border-olive-500/40 dark:bg-olive-800/30"
            >
              {assignableRoles.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
            {newUser.role === 'merchant' && (
              <select
                value={newUser.merchantId}
                onChange={(e) => setNewUser({ ...newUser, merchantId: e.target.value })}
                className="w-full rounded-lg border border-sand-300/60 bg-white/50 px-3 py-2 text-sm dark:border-olive-500/40 dark:bg-olive-800/30"
              >
                <option value="">No merchant linked (onboard later)</option>
                {merchants.map((m) => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
            )}
            {message && <p className="text-sm text-olive-600">{message}</p>}
            <GlassButton type="submit">Create user</GlassButton>
          </form>
        </GlassCard>
      </RoleGate>

      <RoleGate permission="manage_users">
        <section id="users" className="mb-10 scroll-mt-24">
          <h2 className="mb-4 font-serif text-xl font-semibold">Users</h2>
          <div className="space-y-2">
            {users.map((user) => (
              <GlassCard key={user._id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-sand-500">{user.email} · {ROLE_LABELS[user.role]}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`chip-category ${user.status === 'inactive' ? 'opacity-50' : ''}`}>
                    {user.status}
                  </span>
                  <RoleGate permission="assign_roles">
                    {user.role !== 'super_admin' && (
                      <select
                        value={user.role}
                        onChange={(e) => changeRole(user._id, e.target.value as UserRole)}
                        className="rounded-lg border border-sand-300/60 bg-white/50 px-2 py-1 text-sm dark:border-olive-500/40 dark:bg-olive-800/30"
                      >
                        {assignableRoles.map((r) => (
                          <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                        ))}
                      </select>
                    )}
                  </RoleGate>
                  {user.role !== 'super_admin' && (
                    <GlassButton onClick={() => toggleUserStatus(user)}>
                      {user.status === 'active' ? 'Deactivate' : 'Activate'}
                    </GlassButton>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        </section>
      </RoleGate>

      <RoleGate permission="manage_merchants">
        <section id="merchants" className="scroll-mt-24">
          <h2 className="mb-4 font-serif text-xl font-semibold">Merchants</h2>
          <div className="space-y-2">
            {merchants.map((merchant) => (
              <GlassCard key={merchant._id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{merchant.name}</p>
                  <p className="text-sm text-sand-500">{merchant.description || 'No description'}</p>
                </div>
                <div className="flex gap-2">
                  <span className="chip-category">{merchant.status}</span>
                  {merchant.status !== 'approved' && (
                    <GlassButton onClick={() => updateMerchantStatus(merchant, 'approved')}>
                      Approve
                    </GlassButton>
                  )}
                  {merchant.status !== 'suspended' && (
                    <GlassButton onClick={() => updateMerchantStatus(merchant, 'suspended')}>
                      Suspend
                    </GlassButton>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        </section>
      </RoleGate>
    </DashboardShell>
  );
}
