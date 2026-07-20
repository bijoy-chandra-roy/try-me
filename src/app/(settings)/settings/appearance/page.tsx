'use client';

import { RoleGate } from '@/shared/components/RoleGate';
import { AppearanceForm } from '@/features/settings/components/AppearanceForm';

export default function SettingsAppearancePage() {
  return (
    <RoleGate permission="manage_own_profile">
      <AppearanceForm />
    </RoleGate>
  );
}
