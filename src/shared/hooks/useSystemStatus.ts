'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/shared/lib/api-client';
import { usePermission } from '@/shared/hooks/useAuth';

interface SystemStatus {
  maintenanceMode: boolean;
  guestTryOnLimit: number;
}

export function useSystemStatus() {
  const [status, setStatus] = useState<SystemStatus>({
    maintenanceMode: false,
    guestTryOnLimit: 3,
  });
  const [loaded, setLoaded] = useState(false);
  const canBypassMaintenance = usePermission('manage_system');

  useEffect(() => {
    apiClient<SystemStatus>('/system/status')
      .then(setStatus)
      .catch(() => setStatus({ maintenanceMode: false, guestTryOnLimit: 3 }))
      .finally(() => setLoaded(true));
  }, []);

  const tryOnBlocked = status.maintenanceMode && !canBypassMaintenance;

  return { ...status, loaded, tryOnBlocked, canBypassMaintenance };
}
