import { config } from '@/server/config';

const guestTryOnCounts = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60 * 60 * 1000;
const DEFAULT_LIMIT = 3;

export function checkGuestTryOnLimit(
  identifier: string,
  limit = DEFAULT_LIMIT
): { allowed: boolean; remaining: number } {
  const guestLimit = Math.max(1, limit);

  const now = Date.now();
  const entry = guestTryOnCounts.get(identifier);

  if (!entry || now > entry.resetAt) {
    guestTryOnCounts.set(identifier, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: guestLimit - 1 };
  }

  if (entry.count >= guestLimit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: guestLimit - entry.count };
}

export function getGuestIdentifier(request: Request): string {
  if (config.trustProxy) {
    const cfIp = request.headers.get('cf-connecting-ip');
    if (cfIp) return cfIp.trim();

    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) return forwarded.split(',')[0].trim();

    const realIp = request.headers.get('x-real-ip');
    if (realIp) return realIp.trim();
  }

  return 'local';
}
