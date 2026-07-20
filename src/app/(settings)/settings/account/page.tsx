'use client';

import { RoleGate } from '@/shared/components/RoleGate';
import { AccountSecurityForm } from '@/features/settings/components/AccountSecurityForm';

export default function SettingsAccountPage() {
  return (
    <RoleGate permission="manage_own_profile">
      <AccountSecurityForm />
    </RoleGate>
  );
}
