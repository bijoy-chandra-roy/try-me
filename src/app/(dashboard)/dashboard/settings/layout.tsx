'use client';

import { DashboardShell } from '@/features/dashboard/components/DashboardShell';
import { SettingsSubNav } from '@/features/settings/components/SettingsSubNav';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell
      title="Settings"
      description="Manage your profile, security, and store preferences"
    >
      <SettingsSubNav />
      {children}
    </DashboardShell>
  );
}
