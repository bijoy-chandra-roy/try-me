const DEFAULT_CALLBACK = '/dashboard';

/** Allow same-origin relative paths only — blocks open redirects. */
export function safeCallbackUrl(raw: string | null | undefined, fallback = DEFAULT_CALLBACK): string {
  if (!raw || typeof raw !== 'string') return fallback;

  const trimmed = raw.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return fallback;

  try {
    const parsed = new URL(trimmed, 'http://local.invalid');
    if (parsed.origin !== 'http://local.invalid') return fallback;
    if (parsed.username || parsed.password) return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}` || fallback;
  } catch {
    return fallback;
  }
}
