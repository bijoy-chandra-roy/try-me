const DEFAULT_SITE_URL = 'http://localhost:3000';

/**
 * Canonical public origin for the app. Set `NEXT_PUBLIC_SITE_URL` in env
 * (e.g. `https://tryme.example.com`) — Auth.js falls back to the same value.
 */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.AUTH_URL ||
    DEFAULT_SITE_URL;
  return raw.replace(/\/+$/, '');
}

/** Build an absolute URL from a path (leading slash optional). */
export function absoluteUrl(path = '/'): string {
  const base = getSiteUrl();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized === '/' ? '' : normalized}`;
}
