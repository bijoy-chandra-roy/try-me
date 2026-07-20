const guestTryOnCounts = new Map<string, { count: number; resetAt: number }>();

const GUEST_LIMIT = 3;
const WINDOW_MS = 60 * 60 * 1000;

export function checkGuestTryOnLimit(identifier: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = guestTryOnCounts.get(identifier);

  if (!entry || now > entry.resetAt) {
    guestTryOnCounts.set(identifier, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: GUEST_LIMIT - 1 };
  }

  if (entry.count >= GUEST_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: GUEST_LIMIT - entry.count };
}

export function getGuestIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}
