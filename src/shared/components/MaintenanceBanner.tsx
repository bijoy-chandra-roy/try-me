'use client';

import { useSystemStatus } from '@/shared/hooks/useSystemStatus';

export function MaintenanceBanner() {
  const { maintenanceMode, loaded, canBypassMaintenance } = useSystemStatus();

  if (!loaded || !maintenanceMode) return null;

  return (
    <div
      className="border-b px-6 py-3 text-center text-sm"
      style={{
        borderColor: 'var(--color-warning-muted)',
        background: 'var(--color-warning-muted)',
        color: 'var(--color-warning)',
      }}
    >
      {canBypassMaintenance
        ? 'Maintenance mode is active. You have super-admin bypass for try-on.'
        : 'Virtual try-on is temporarily unavailable for maintenance. Browse the catalog in the meantime.'}
    </div>
  );
}
