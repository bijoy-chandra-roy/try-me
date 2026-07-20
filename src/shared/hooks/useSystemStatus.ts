'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/shared/lib/api-client';
import { usePermission } from '@/shared/hooks/useAuth';

interface SystemStatus {
  maintenanceMode: boolean;
  guestTryOnLimit: number;
}

export function useSystemStatus(initial?: Partial<SystemStatus>) {
  const [status, setStatus] = useState<SystemStatus>({
    maintenanceMode: initial?.maintenanceMode ?? false,
    guestTryOnLimit: initial?.guestTryOnLimit ?? 3,
  });
  const [loaded, setLoaded] = useState(initial?.maintenanceMode !== undefined);
  const canBypassMaintenance = usePermission('manage_system');

  useEffect(() => {
    apiClient<SystemStatus>('/system/status')
      .then(setStatus)
      .catch(() =>
        setStatus({
          maintenanceMode: initial?.maintenanceMode ?? false,
          guestTryOnLimit: initial?.guestTryOnLimit ?? 3,
        })
      )
      .finally(() => setLoaded(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed once from SSR
  }, []);

  const tryOnBlocked = status.maintenanceMode && !canBypassMaintenance;

  return { ...status, loaded, tryOnBlocked, canBypassMaintenance };
}
