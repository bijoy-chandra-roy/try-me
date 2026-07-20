'use client';

import { useSystemStatus } from '@/shared/hooks/useSystemStatus';
import { useT } from '@/shared/hooks/useT';

interface MaintenanceBannerProps {
  /** SSR-seeded value so the banner can occupy space on first paint when active. */
  initialMaintenanceMode?: boolean;
}

export function MaintenanceBanner({ initialMaintenanceMode }: MaintenanceBannerProps = {}) {
  const { maintenanceMode, loaded, canBypassMaintenance } = useSystemStatus(
    initialMaintenanceMode !== undefined
      ? { maintenanceMode: initialMaintenanceMode }
      : undefined
  );
  const t = useT();

  // Show immediately when SSR says maintenance is on; otherwise wait for client confirm.
  const show = loaded ? maintenanceMode : initialMaintenanceMode === true;

  if (!show) return null;

  return (
    <div
      className="border-b px-6 py-3 text-center text-sm"
      style={{
        borderColor: 'var(--color-warning-muted)',
        background: 'var(--color-warning-muted)',
        color: 'var(--color-warning)',
      }}
    >
      {canBypassMaintenance ? t('maintenance.bypass') : t('maintenance.public')}
    </div>
  );
}
