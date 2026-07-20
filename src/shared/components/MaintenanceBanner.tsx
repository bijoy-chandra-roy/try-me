'use client';

import { useSystemStatus } from '@/shared/hooks/useSystemStatus';

export function MaintenanceBanner() {
  const { maintenanceMode, loaded, canBypassMaintenance } = useSystemStatus();

  if (!loaded || !maintenanceMode) return null;

  return (
    <div className="border-b border-amber-300/60 bg-amber-50 px-6 py-3 text-center text-sm text-amber-900 dark:border-amber-700/40 dark:bg-amber-900/20 dark:text-amber-200">
      {canBypassMaintenance
        ? 'Maintenance mode is active. You have super-admin bypass for try-on.'
        : 'Virtual try-on is temporarily unavailable for maintenance. Browse the catalog in the meantime.'}
    </div>
  );
}
