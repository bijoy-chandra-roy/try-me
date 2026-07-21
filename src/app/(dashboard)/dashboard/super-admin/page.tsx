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
import { Checkbox } from '@/shared/components/Checkbox';
import { ScrollArea } from '@/shared/components/ScrollArea';
import { OverflowText } from '@/shared/components/OverflowText';
import { apiClient } from '@/shared/lib/api-client';
import { ROLE_LABELS, USER_ROLES } from '@/shared/auth/roles';
import { OrdersPanel } from '@/features/orders/components/OrdersPanel';
import { StatCardsSkeleton } from '@/shared/components/Skeleton';
import { useT } from '@/shared/hooks/useT';
import type { DashboardStats, Merchant, User, UserRole } from '@/shared/types';

interface SystemConfig {
  maintenanceMode: boolean;
  guestTryOnLimit: number;
}

export default function SuperAdminDashboardPage() {
  const t = useT();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [flags, setFlags] = useState<SystemConfig>({ maintenanceMode: false, guestTryOnLimit: 3 });
  const [message, setMessage] = useState('');
  const [savingFlags, setSavingFlags] = useState(false);

  async function loadAll() {
    const [statsData, usersData, merchantsData, configData] = await Promise.all([
      apiClient<DashboardStats>('/dashboard/stats'),
      apiClient<User[]>('/users'),
      apiClient<Merchant[]>('/merchants'),
      apiClient<SystemConfig>('/system/config'),
    ]);
    setStats(statsData);
    setUsers(usersData);
    setMerchants(merchantsData);
    setFlags(configData);
  }

  useEffect(() => {
    loadAll().catch(() => setMessage('Failed to load system data'));
  }, []);

  async function saveFlags() {
    setSavingFlags(true);
    try {
      const updated = await apiClient<SystemConfig>('/system/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flags),
      });
      setFlags(updated);
      setMessage('System configuration saved');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to save configuration');
    } finally {
      setSavingFlags(false);
    }
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

  async function toggleUserStatus(user: User) {
    await apiClient(`/users/${user._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: user.status === 'active' ? 'inactive' : 'active' }),
    });
    await loadAll();
  }

  async function updateMerchantStatus(merchant: Merchant, status: Merchant['status']) {
    await apiClient(`/merchants/${merchant._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    await loadAll();
  }

  return (
    <DashboardShell
      title={t('dashboard.superAdmin.title')}
      description={t('dashboard.superAdmin.description')}
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
            <StatCard label="Revenue" value={`$${(stats.totalRevenue ?? 0).toFixed(0)}`} />
          </div>
        ) : (
          <StatCardsSkeleton
            count={6}
            className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
          />
        )}
      </RoleGate>

      <RoleGate permission="view_all_orders">
        <div className="mb-10">
          <OrdersPanel mode="all" showSearch allowAdvance allowMarkPaid />
        </div>
      </RoleGate>

      <RoleGate permission="manage_system">
        <div id="flags" className="mb-10 scroll-mt-24">
          <GlassCard className="p-6" elastic={false}>
            <h2 className="font-serif text-xl font-semibold">System configuration</h2>
            <p className="mt-1 text-sm text-muted-subtle">
              Controls maintenance mode and guest try-on limits across the platform
            </p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Maintenance mode</span>
                <Checkbox
                  checked={flags.maintenanceMode}
                  onChange={(maintenanceMode) => setFlags({ ...flags, maintenanceMode })}
                  aria-label="Maintenance mode"
                />
              </div>
              <label className="flex items-center justify-between text-sm">
                Guest try-on limit (per hour)
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={flags.guestTryOnLimit}
                  onChange={(e) =>
                    setFlags({ ...flags, guestTryOnLimit: Number(e.target.value) })
                  }
                  className="input-glass w-16"
                />
              </label>
            </div>
            <Button onClick={saveFlags} disabled={savingFlags} className="mt-4">
              {savingFlags ? 'Saving...' : 'Save configuration'}
            </Button>
          </GlassCard>
        </div>
      </RoleGate>

      <RoleGate permission="view_system_health">
        <GlassCard className="mb-10 p-6" elastic={false}>
          <h2 className="font-serif text-xl font-semibold">Recent try-ons</h2>
          <div className="mt-4">
            <ScrollArea edgeInset={4} viewportClassName="max-h-48">
              <div className="space-y-2">
                {stats?.recentTryOns.map((item) => (
                  <div key={item._id} className="text-sm">
                    <span className="font-medium">{item.productName}</span>
                    <span className="text-muted-subtle">
                      {' '}
                      · {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </GlassCard>
      </RoleGate>

      {message && <p className="mb-4 text-sm text-success">{message}</p>}

      <RoleGate permission="assign_roles">
        <section id="roles" className="mb-10 scroll-mt-24">
          <h2 className="mb-4 font-serif text-xl font-semibold">Role assignment</h2>
          <DataList>
            {users.map((user) => (
              <ListRow key={user._id} dimmed={user.status === 'inactive'}>
                <div className="min-w-0">
                  <OverflowText className="font-medium" title={user.name}>
                    {user.name}
                  </OverflowText>
                  <OverflowText className="text-sm text-muted-subtle" title={user.email}>
                    {user.email}
                  </OverflowText>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusChip status={user.status} />
                  <span className="chip-category">{ROLE_LABELS[user.role]}</span>
                  <Select
                    value={user.role}
                    onChange={(role) => changeRole(user._id, role)}
                    options={USER_ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }))}
                    aria-label={`Change role for ${user.name}`}
                    className="text-sm"
                  />
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
