import path from 'path';
import { getSiteUrl } from '@/shared/lib/site-url';

function parseTrustProxy(): boolean {
  const raw = (process.env.TRUST_PROXY || '').trim().toLowerCase();
  return raw === 'true' || raw === '1';
}

export const config = {
  /** Public site origin — set via `NEXT_PUBLIC_SITE_URL` for deploy. */
  siteUrl: getSiteUrl(),
  useInMemoryDb: process.env.USE_IN_MEMORY_DB === 'true',
  /** When true, honor X-Forwarded-For / X-Real-IP for guest rate limits (set on Vercel/proxied deploys). */
  trustProxy: parseTrustProxy(),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/tryme',
  imgbbApiKey: (process.env.IMGBB_API_KEY || '').trim(),
  vtoApiUrl:
    process.env.VTO_API_URL || 'https://yisol-idm-vton.hf.space/call/tryon',
  vtoTimeoutMs: parseInt(process.env.VTO_TIMEOUT_MS || '300000', 10),
  hfToken: process.env.HF_TOKEN || '',
  fallbackImagePath: path.join(process.cwd(), 'cache/fallback-vto-result.jpg'),
  /** Payment provider: `cod` (default) or `stripe` (not configured yet). */
  paymentProvider: (process.env.PAYMENT_PROVIDER || 'cod').toLowerCase(),
};

/** Refuse in-memory DB + demo seed in production — prevents known default credentials. */
export function assertSafeProductionConfig(): void {
  if (process.env.NODE_ENV !== 'production') return;

  if (config.useInMemoryDb) {
    throw new Error(
      'USE_IN_MEMORY_DB=true is not allowed in production. Set USE_IN_MEMORY_DB=false and configure MONGODB_URI.'
    );
  }

  if (!process.env.AUTH_SECRET?.trim()) {
    throw new Error('AUTH_SECRET is required in production.');
  }
}
