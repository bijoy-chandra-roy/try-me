'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/features/dashboard/components/DashboardShell';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { GlassCard } from '@/shared/components/GlassCard';
import { GlassButton } from '@/shared/components/GlassButton';
import { RoleGate } from '@/shared/components/RoleGate';
import { Select } from '@/shared/components/Select';
import { apiClient } from '@/shared/lib/api-client';
import { ROLE_LABELS, USER_ROLES } from '@/shared/auth/roles';
import { OrdersPanel } from '@/features/orders/components/OrdersPanel';
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
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard label="Users" value={stats.totalUsers} />
            <StatCard label="Products" value={stats.totalProducts} />
            <StatCard label="Merchants" value={stats.totalMerchants} />
            <StatCard label="Try-ons" value={stats.totalTryOns} />
            <StatCard label="Orders" value={stats.totalOrders ?? 0} />
            <StatCard
              label="Revenue"
              value={`$${(stats.totalRevenue ?? 0).toFixed(0)}`}
            />
          </div>
        )}

        <GlassCard className="mb-8 p-6">
          <h2 className="font-serif text-xl font-semibold">System health</h2>
          <p className="mt-2 text-3xl font-semibold capitalize">{health}</p>
        </GlassCard>
      </RoleGate>

      <RoleGate permission="view_all_orders">
        <div className="mb-10">
          <OrdersPanel mode="all" showSearch allowAdvance allowMarkPaid />
        </div>
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
              className="input-glass w-full rounded-lg px-3 py-2"
            />
            <input
              placeholder="Email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              required
              className="input-glass w-full rounded-lg px-3 py-2"
            />
            <input
              placeholder="Password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              required
              className="input-glass w-full rounded-lg px-3 py-2"
            />
            <Select
              value={newUser.role}
              onChange={(role) => setNewUser({ ...newUser, role })}
              options={assignableRoles.map((r) => ({ value: r, label: ROLE_LABELS[r] }))}
              aria-label="Role"
              className="w-full rounded-lg px-3 py-2"
            />
            {newUser.role === 'merchant' && (
              <Select
                value={newUser.merchantId}
                onChange={(merchantId) => setNewUser({ ...newUser, merchantId })}
                options={[
                  { value: '', label: 'No merchant linked (onboard later)' },
                  ...merchants.map((m) => ({ value: m._id, label: m.name })),
                ]}
                aria-label="Merchant"
                className="w-full rounded-lg px-3 py-2"
              />
            )}
            {message && <p className="text-sm text-success">{message}</p>}
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
                  <p className="text-sm text-muted-subtle">{user.email} · {ROLE_LABELS[user.role]}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`chip-category ${user.status === 'inactive' ? 'opacity-50' : ''}`}>
                    {user.status}
                  </span>
                  <RoleGate permission="assign_roles">
                    {user.role !== 'super_admin' && (
                      <Select
                        value={user.role}
                        onChange={(role) => changeRole(user._id, role)}
                        options={assignableRoles.map((r) => ({ value: r, label: ROLE_LABELS[r] }))}
                        aria-label={`Change role for ${user.name}`}
                        className="rounded-lg px-2 py-1 text-sm"
                      />
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
                  <p className="text-sm text-muted-subtle">{merchant.description || 'No description'}</p>
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
