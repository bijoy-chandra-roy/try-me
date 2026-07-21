'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useSession } from 'next-auth/react';
import { isUserRole } from '@/shared/auth/roles';
import type { UserRole } from '@/shared/auth/roles';
import { getPermissionsForRole, hasPermission, type Permission } from '@/shared/auth/permissions';

const LAST_KNOWN_KEY = 'tryme:last-known-auth';

export type AuthConnectivity = 'online' | 'offline';

export interface AuthSnapshot {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  realRole?: UserRole;
  actingAsRole?: UserRole | null;
  merchantId?: string | null;
  status?: 'active' | 'inactive';
}

let snapshotCache: AuthSnapshot | null | undefined;
let snapshotListeners = new Set<() => void>();

function parseSnapshot(raw: string | null): AuthSnapshot | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AuthSnapshot;
    if (!parsed?.id || !isUserRole(parsed.role)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function getSnapshotCache(): AuthSnapshot | null {
  if (snapshotCache !== undefined) return snapshotCache;
  if (typeof window === 'undefined') {
    snapshotCache = null;
    return null;
  }
  try {
    snapshotCache = parseSnapshot(sessionStorage.getItem(LAST_KNOWN_KEY));
  } catch {
    snapshotCache = null;
  }
  return snapshotCache;
}

function emitSnapshot() {
  for (const listener of snapshotListeners) listener();
}

function writeSnapshot(snapshot: AuthSnapshot | null) {
  snapshotCache = snapshot;
  if (typeof window !== 'undefined') {
    try {
      if (!snapshot) {
        sessionStorage.removeItem(LAST_KNOWN_KEY);
      } else {
        sessionStorage.setItem(LAST_KNOWN_KEY, JSON.stringify(snapshot));
      }
    } catch {
      /* ignore quota / private mode */
    }
  }
  emitSnapshot();
}

export function clearLastKnownAuth() {
  writeSnapshot(null);
}

function subscribeSnapshot(listener: () => void) {
  snapshotListeners.add(listener);
  return () => {
    snapshotListeners.delete(listener);
  };
}

let connectivityListeners = new Set<() => void>();
let connectivityState: AuthConnectivity =
  typeof navigator !== 'undefined' && navigator.onLine === false ? 'offline' : 'online';

function emitConnectivity() {
  for (const listener of connectivityListeners) listener();
}

function setConnectivity(next: AuthConnectivity) {
  if (connectivityState === next) return;
  connectivityState = next;
  emitConnectivity();
}

function subscribeConnectivity(listener: () => void) {
  connectivityListeners.add(listener);
  return () => {
    connectivityListeners.delete(listener);
  };
}

function getConnectivitySnapshot(): AuthConnectivity {
  return connectivityState;
}

function getConnectivityServerSnapshot(): AuthConnectivity {
  return 'online';
}

/** Mark connectivity from network events or failed session fetches. */
export function reportAuthConnectivity(online: boolean) {
  setConnectivity(online ? 'online' : 'offline');
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => setConnectivity('online'));
  window.addEventListener('offline', () => setConnectivity('offline'));
}

function useConnectivity(): AuthConnectivity {
  return useSyncExternalStore(
    subscribeConnectivity,
    getConnectivitySnapshot,
    getConnectivityServerSnapshot
  );
}

function useLastKnownSnapshot(): AuthSnapshot | null {
  return useSyncExternalStore(subscribeSnapshot, getSnapshotCache, () => null);
}

function snapshotFromSession(user: {
  id: string;
  email?: string | null;
  name?: string | null;
  role: UserRole;
  realRole?: UserRole;
  actingAsRole?: UserRole | null;
  merchantId?: string | null;
  status?: 'active' | 'inactive';
}): AuthSnapshot {
  return {
    id: user.id,
    email: user.email ?? '',
    name: user.name ?? '',
    role: user.role,
    realRole: user.realRole && isUserRole(user.realRole) ? user.realRole : user.role,
    actingAsRole: user.actingAsRole ?? null,
    merchantId: user.merchantId ?? null,
    status: user.status ?? 'active',
  };
}

export function useAuth() {
  const { data: session, status, update } = useSession();
  const connectivity = useConnectivity();
  const lastKnown = useLastKnownSnapshot();

  const sessionRole = session?.user?.role;
  const liveRole = sessionRole && isUserRole(sessionRole) ? sessionRole : undefined;

  const useLastKnown =
    status !== 'authenticated' &&
    connectivity === 'offline' &&
    lastKnown != null &&
    lastKnown.status !== 'inactive';

  const effectiveUser = session?.user
    ? session.user
    : useLastKnown
      ? lastKnown
      : null;

  const role =
    effectiveUser?.role && isUserRole(effectiveUser.role) ? effectiveUser.role : undefined;

  const realRoleRaw =
    effectiveUser && 'realRole' in effectiveUser
      ? (effectiveUser as AuthSnapshot).realRole
      : undefined;
  const realRole =
    realRoleRaw && isUserRole(realRoleRaw)
      ? realRoleRaw
      : role;

  const actingAsRoleRaw =
    effectiveUser && 'actingAsRole' in effectiveUser
      ? (effectiveUser as AuthSnapshot).actingAsRole
      : undefined;
  const actingAsRole =
    actingAsRoleRaw && isUserRole(actingAsRoleRaw) ? actingAsRoleRaw : null;
  const isAssumingRole =
    realRole === 'super_admin' &&
    actingAsRole != null &&
    actingAsRole !== 'super_admin';

  const isResolved = status !== 'loading' || lastKnown != null;
  const isAuthenticated =
    status === 'authenticated' ||
    (useLastKnown && lastKnown != null) ||
    (status === 'loading' && lastKnown != null && connectivity === 'offline');

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id && liveRole) {
      writeSnapshot(
        snapshotFromSession({
          ...session.user,
          role: liveRole,
          realRole: session.user.realRole,
          actingAsRole: session.user.actingAsRole,
        })
      );
      reportAuthConnectivity(true);
      return;
    }

    if (status === 'unauthenticated' && connectivity === 'online') {
      writeSnapshot(null);
    }
  }, [status, session?.user, liveRole, connectivity]);

  return {
    user: effectiveUser,
    role,
    realRole,
    actingAsRole,
    isAssumingRole,
    permissions: role ? getPermissionsForRole(role) : [],
    isLoading: !isResolved,
    isResolved,
    isAuthenticated,
    connectivity,
    update,
  };
}

export function usePermission(permission: Permission): boolean {
  const { role, isResolved } = useAuth();
  if (!isResolved || !role) return false;
  return hasPermission(role, permission);
}

export function usePermissions(): Permission[] {
  const { role, isResolved } = useAuth();
  if (!isResolved || !role) return [];
  return getPermissionsForRole(role);
}
