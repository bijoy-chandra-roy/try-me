'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/features/dashboard/components/DashboardShell';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { GlassCard } from '@/shared/components/GlassCard';
import { Button } from '@/shared/components/Button';
import { DataList, ListRow } from '@/shared/components/DataList';
import { StatusChip } from '@/shared/components/StatusChip';
import { Popover } from '@/shared/components/Popover';
import { RoleGate } from '@/shared/components/RoleGate';
import { Select } from '@/shared/components/Select';
import { OverflowText } from '@/shared/components/OverflowText';
import { apiClient } from '@/shared/lib/api-client';
import { ROLE_LABELS, USER_ROLES } from '@/shared/auth/roles';
import { OrdersPanel } from '@/features/orders/components/OrdersPanel';
import { StatCardsSkeleton } from '@/shared/components/Skeleton';
import { useT } from '@/shared/hooks/useT';
import type { DashboardStats, Merchant, User, UserRole } from '@/shared/types';

export default function AdminDashboardPage() {
  const t = useT();
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
      const updated = await apiClient<User>(`/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (updated.role !== role) {
        setMessage('Role update failed');
        await loadAll();
        return;
      }
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
      title={t('dashboard.admin.title')}
      description={t('dashboard.admin.description')}
    >
      <RoleGate
        permission="view_system_health"
        loadingFallback={
          <StatCardsSkeleton
            count={6}
            className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
          />
        }
      >
        {stats ? (
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
        ) : (
          <StatCardsSkeleton
            count={6}
            className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
          />
        )}

        <GlassCard className="mb-8 p-6" elastic={false}>
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
        <GlassCard className="mb-8 p-6" elastic={false}>
          <h2 className="font-serif text-xl font-semibold">Create user</h2>
          <form onSubmit={createUser} className="mt-4 space-y-3">
            <input
              placeholder="Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              required
              className="input-glass w-full"
            />
            <input
              placeholder="Email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              required
              className="input-glass w-full"
            />
            <input
              placeholder="Password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              required
              className="input-glass w-full"
            />
            <Select
              value={newUser.role}
              onChange={(role) => setNewUser({ ...newUser, role })}
              options={assignableRoles.map((r) => ({ value: r, label: ROLE_LABELS[r] }))}
              aria-label="Role"
              className="w-full"
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
                className="w-full"
              />
            )}
            {message && <p className="text-sm text-success">{message}</p>}
            <Button type="submit">Create user</Button>
          </form>
        </GlassCard>
      </RoleGate>

      <RoleGate permission="manage_users">
        <section id="users" className="mb-10 scroll-mt-24">
          <h2 className="mb-4 font-serif text-xl font-semibold">Users</h2>
          <DataList>
            {users.map((user) => (
              <ListRow key={user._id} dimmed={user.status === 'inactive'}>
                <div className="min-w-0">
                  <OverflowText className="font-medium" title={user.name}>
                    {user.name}
                  </OverflowText>
                  <OverflowText className="text-sm text-muted-subtle">
                    {user.email} · {ROLE_LABELS[user.role]}
                  </OverflowText>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusChip status={user.status} />
                  <RoleGate permission="assign_roles">
                    {user.role !== 'super_admin' && (
                      <Select
                        value={user.role}
                        onChange={(role) => changeRole(user._id, role)}
                        options={assignableRoles.map((r) => ({ value: r, label: ROLE_LABELS[r] }))}
                        aria-label={`Change role for ${user.name}`}
                        className="text-sm"
                      />
                    )}
                  </RoleGate>
                  {user.role !== 'super_admin' && (
                    <Popover
                      label={`Actions for ${user.name}`}
                      items={[
                        {
                          label: user.status === 'active' ? 'Deactivate' : 'Activate',
                          onClick: () => toggleUserStatus(user),
                          destructive: user.status === 'active',
                        },
                      ]}
                    />
                  )}
                </div>
              </ListRow>
            ))}
          </DataList>
        </section>
      </RoleGate>

      <RoleGate permission="manage_merchants">
        <section id="merchants" className="scroll-mt-24">
          <h2 className="mb-4 font-serif text-xl font-semibold">Merchants</h2>
          <DataList>
            {merchants.map((merchant) => {
              const actions: { label: string; onClick: () => void; destructive?: boolean }[] = [];
              if (merchant.status !== 'approved') {
                actions.push({
                  label: 'Approve',
                  onClick: () => updateMerchantStatus(merchant, 'approved'),
                });
              }
              if (merchant.status !== 'suspended') {
                actions.push({
                  label: 'Suspend',
                  onClick: () => updateMerchantStatus(merchant, 'suspended'),
                  destructive: true,
                });
              }
              return (
                <ListRow key={merchant._id}>
                  <div className="min-w-0">
                    <OverflowText className="font-medium" title={merchant.name}>
                      {merchant.name}
                    </OverflowText>
                    <OverflowText className="text-sm text-muted-subtle">
                      {merchant.description || 'No description'}
                    </OverflowText>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusChip status={merchant.status} />
                    {actions.length > 0 && (
                      <Popover label={`Actions for ${merchant.name}`} items={actions} />
                    )}
                  </div>
                </ListRow>
              );
            })}
          </DataList>
        </section>
      </RoleGate>
    </DashboardShell>
  );
}
