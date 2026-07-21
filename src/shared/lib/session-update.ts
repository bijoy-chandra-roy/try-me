'use client';

import type { Session } from 'next-auth';
import type { UserRole } from '@/shared/auth/roles';

export type SessionUpdateData = {
  assumeRole?: UserRole | null;
  merchantId?: string | null;
};

export type SessionUpdater = (data?: SessionUpdateData) => Promise<Session | null | undefined>;

type QueuedUpdate = {
  data?: SessionUpdateData;
  resolve: (value: Session | null | undefined) => void;
  reject: (reason: unknown) => void;
};

let chain: Promise<void> = Promise.resolve();
let inflight = 0;

/** True while any queued session update is running (including assume). */
export function isSessionUpdateBusy(): boolean {
  return inflight > 0;
}

/**
 * Serialize NextAuth `session.update` calls so we never hit the
 * `if (loading) return` silent no-op in next-auth/react.
 */
export function runSessionUpdate(
  update: SessionUpdater,
  data?: SessionUpdateData
): Promise<Session | null | undefined> {
  return new Promise((resolve, reject) => {
    const job: QueuedUpdate = { data, resolve, reject };
    chain = chain.then(() => runJob(update, job)).catch(() => {
      /* keep queue alive after a failed job */
    });
  });
}

async function runJob(update: SessionUpdater, job: QueuedUpdate) {
  inflight += 1;
  try {
    let result = await update(job.data);

    // NextAuth returns undefined when called while its internal `loading` is true.
    // Retry once after a short wait if we somehow raced outside our queue.
    if (result === undefined) {
      await sleep(50);
      result = await update(job.data);
    }

    job.resolve(result);
  } catch (err) {
    job.reject(err);
  } finally {
    inflight -= 1;
  }
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}
