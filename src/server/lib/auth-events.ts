import { EventEmitter } from 'events';
import type { UserRole } from '@/shared/auth/roles';

export type AuthEventType = 'user.updated' | 'user.revoked';

export interface AuthEventPayload {
  userId: string;
  type: AuthEventType;
  role?: UserRole;
  status?: 'active' | 'inactive';
  name?: string;
  merchantId?: string | null;
  at: number;
}

const globalForAuthEvents = globalThis as typeof globalThis & {
  __trymeAuthEvents?: EventEmitter;
};

function getBus(): EventEmitter {
  if (!globalForAuthEvents.__trymeAuthEvents) {
    globalForAuthEvents.__trymeAuthEvents = new EventEmitter();
    globalForAuthEvents.__trymeAuthEvents.setMaxListeners(100);
  }
  return globalForAuthEvents.__trymeAuthEvents;
}

function channelFor(userId: string) {
  return `user:${userId}`;
}

export function publishAuthEvent(
  event: Omit<AuthEventPayload, 'at'> & { at?: number }
): void {
  const payload: AuthEventPayload = {
    ...event,
    at: event.at ?? Date.now(),
  };
  getBus().emit(channelFor(payload.userId), payload);
}

export function subscribeAuthEvents(
  userId: string,
  listener: (event: AuthEventPayload) => void
): () => void {
  const bus = getBus();
  const channel = channelFor(userId);
  bus.on(channel, listener);
  return () => {
    bus.off(channel, listener);
  };
}
