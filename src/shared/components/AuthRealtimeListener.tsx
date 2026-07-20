'use client';

import { useEffect, useRef } from 'react';
import { signOut, useSession } from 'next-auth/react';
import {
  clearLastKnownAuth,
  reportAuthConnectivity,
} from '@/shared/hooks/useAuth';

const BASE_RETRY_MS = 1_000;
const MAX_RETRY_MS = 30_000;

/**
 * Subscribes to server-sent auth events so role/status changes
 * from admins apply immediately without waiting for the session poll.
 */
export function AuthRealtimeListener() {
  const { data: session, status, update } = useSession();
  const userId = session?.user?.id;
  const retryRef = useRef(BASE_RETRY_MS);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (status !== 'authenticated' || !userId) {
      esRef.current?.close();
      esRef.current = null;
      return;
    }

    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    function connect() {
      if (cancelled || document.visibilityState === 'hidden') return;

      esRef.current?.close();
      const es = new EventSource('/api/auth/events');
      esRef.current = es;

      es.addEventListener('connected', () => {
        reportAuthConnectivity(true);
        retryRef.current = BASE_RETRY_MS;
      });

      es.addEventListener('heartbeat', () => {
        reportAuthConnectivity(true);
      });

      es.addEventListener('user.updated', () => {
        reportAuthConnectivity(true);
        void update();
      });

      es.addEventListener('user.revoked', () => {
        reportAuthConnectivity(true);
        clearLastKnownAuth();
        es.close();
        void signOut({ callbackUrl: '/login?error=AccountInactive' });
      });

      es.onerror = () => {
        es.close();
        esRef.current = null;
        if (cancelled) return;

        if (!navigator.onLine) {
          reportAuthConnectivity(false);
        }

        const delay = retryRef.current;
        retryRef.current = Math.min(retryRef.current * 2, MAX_RETRY_MS);
        retryTimer = setTimeout(connect, delay);
      };
    }

    function onVisibility() {
      if (document.visibilityState === 'visible') {
        reportAuthConnectivity(navigator.onLine);
        if (navigator.onLine) {
          void update();
          if (!esRef.current || esRef.current.readyState === EventSource.CLOSED) {
            connect();
          }
        }
      }
    }

    function onOnline() {
      reportAuthConnectivity(true);
      retryRef.current = BASE_RETRY_MS;
      void update();
      connect();
    }

    function onOffline() {
      reportAuthConnectivity(false);
      esRef.current?.close();
      esRef.current = null;
    }

    connect();
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      esRef.current?.close();
      esRef.current = null;
    };
  }, [status, userId, update]);

  return null;
}
