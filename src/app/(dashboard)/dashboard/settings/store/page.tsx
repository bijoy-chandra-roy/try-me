'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RoleGate } from '@/shared/components/RoleGate';
import { StoreSettingsForm } from '@/features/settings/components/StoreSettingsForm';
import { useAuth } from '@/shared/hooks/useAuth';

export default function SettingsStorePage() {
  const { role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && role && role !== 'merchant') {
      router.replace('/dashboard/settings/profile');
    }
  }, [role, isLoading, router]);

  if (role !== 'merchant') return null;

  return (
    <RoleGate permission="manage_merchants">
      <StoreSettingsForm />
    </RoleGate>
  );
}
