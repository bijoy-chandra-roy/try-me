const DEFAULT_SITE_URL = 'http://localhost:3000';

/** Vercel sets these at runtime — use them before localhost defaults. */
function getVercelSiteUrl(): string | undefined {
  const host =
    process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  return host ? `https://${host}` : undefined;
}

/**
 * Canonical public origin for the app. Set `NEXT_PUBLIC_SITE_URL` in env
 * (e.g. `https://tryme.example.com`). On Vercel, `VERCEL_URL` is used as a
 * runtime fallback so auth/metadata work even when the public env was missing
 * at build time.
 */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.AUTH_URL ||
    getVercelSiteUrl() ||
    DEFAULT_SITE_URL;
  return raw.replace(/\/+$/, '');
}

/** Build an absolute URL from a path (leading slash optional). */
export function absoluteUrl(path = '/'): string {
  const base = getSiteUrl();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized === '/' ? '' : normalized}`;
}
