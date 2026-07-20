'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/features/dashboard/components/DashboardShell';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { GlassCard } from '@/shared/components/GlassCard';
import { GlassButton } from '@/shared/components/GlassButton';
import { RoleGate } from '@/shared/components/RoleGate';
import { Select } from '@/shared/components/Select';
import { Checkbox } from '@/shared/components/Checkbox';
import { ScrollArea } from '@/shared/components/ScrollArea';
import { apiClient } from '@/shared/lib/api-client';
import { ROLE_LABELS, USER_ROLES } from '@/shared/auth/roles';
import type { DashboardStats, Merchant, User, UserRole } from '@/shared/types';

interface SystemConfig {
  maintenanceMode: boolean;
  guestTryOnLimit: number;
}

export default function SuperAdminDashboardPage() {
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
      title="Super Admin Dashboard"
      description="Full system control, role assignment, and configuration"
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
      </RoleGate>

      <RoleGate permission="manage_system">
        <div id="flags" className="mb-10 scroll-mt-24">
          <GlassCard className="p-6">
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
                  className="input-glass w-16 rounded px-2 py-1"
                />
              </label>
            </div>
            <GlassButton onClick={saveFlags} disabled={savingFlags} className="mt-4">
              {savingFlags ? 'Saving...' : 'Save configuration'}
            </GlassButton>
          </GlassCard>
        </div>
      </RoleGate>

      <RoleGate permission="view_system_health">
        <GlassCard className="mb-10 p-6">
          <h2 className="font-serif text-xl font-semibold">Recent try-ons</h2>
          <div className="mt-4">
            <ScrollArea edgeInset={4} viewportClassName="max-h-48">
              <div className="space-y-2">
                {stats?.recentTryOns.map((item) => (
                  <div key={item._id} className="text-sm">
                    <span className="font-medium">{item.productName}</span>
                    <span className="text-muted-subtle"> · {new Date(item.createdAt).toLocaleString()}</span>
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
          <div className="space-y-2">
            {users.map((user) => (
              <GlassCard key={user._id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-subtle">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="chip-category">{ROLE_LABELS[user.role]}</span>
                  <Select
                    value={user.role}
                    onChange={(role) => changeRole(user._id, role)}
                    options={USER_ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }))}
                    aria-label={`Change role for ${user.name}`}
                    className="rounded-lg px-2 py-1 text-sm"
                  />
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
