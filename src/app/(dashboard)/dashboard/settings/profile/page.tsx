'use client';

import { RoleGate } from '@/shared/components/RoleGate';
import { ProfileForm } from '@/features/settings/components/ProfileForm';

export default function SettingsProfilePage() {
  return (
    <RoleGate permission="manage_own_profile">
      <ProfileForm />
    </RoleGate>
  );
}
