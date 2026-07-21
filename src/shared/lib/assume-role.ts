'use client';

import type { Session } from 'next-auth';
import { getDashboardPath, isUserRole, type UserRole } from '@/shared/auth/roles';
import {
  runSessionUpdate,
  type SessionUpdateData,
  type SessionUpdater,
} from '@/shared/lib/session-update';

export type { SessionUpdater, SessionUpdateData };

function assertAssumedSession(
  session: Session | null | undefined,
  expectedRole: UserRole,
  merchantId?: string | null
): Session {
  if (!session?.user?.role || !isUserRole(session.user.role)) {
    throw new Error('Session update failed — try again');
  }

  if (session.user.role !== expectedRole) {
    throw new Error('Session update failed — try again');
  }

  if (expectedRole === 'merchant') {
    if (!merchantId || session.user.merchantId !== merchantId) {
      throw new Error('Session update failed — try again');
    }
  }

  if (expectedRole === 'super_admin') {
    if (session.user.actingAsRole) {
      throw new Error('Session update failed — try again');
    }
  }

  return session;
}

export async function assumeRole(
  update: SessionUpdater,
  role: UserRole,
  merchantId?: string | null
): Promise<UserRole> {
  let payload: SessionUpdateData;
  let expected: UserRole;

  if (role === 'merchant') {
    if (!merchantId) {
      throw new Error('Merchant id is required to assume the merchant role');
    }
    payload = { assumeRole: 'merchant', merchantId };
    expected = 'merchant';
  } else if (role === 'super_admin') {
    payload = { assumeRole: null };
    expected = 'super_admin';
  } else {
    payload = { assumeRole: role, merchantId: null };
    expected = role;
  }

  const session = await runSessionUpdate(update, payload);
  assertAssumedSession(session, expected, merchantId);
  return expected;
}

export async function exitAssumeRole(update: SessionUpdater): Promise<void> {
  await assumeRole(update, 'super_admin');
}

export function dashboardPathAfterAssume(role: UserRole): string {
  return getDashboardPath(role);
}

/** Bare session refresh (SSE / visibility) — queued so it cannot race assume. */
export async function refreshSession(update: SessionUpdater): Promise<void> {
  // Pass `{}` so Auth.js uses trigger:"update" and forces a JWT rewrite/sync.
  // Do not pass `undefined` (that is a plain GET and may not force sync).
  await runSessionUpdate(update, {});
}
