import path from 'path';
import { getSiteUrl } from '@/shared/lib/site-url';

export const config = {
  /** Public site origin — set via `NEXT_PUBLIC_SITE_URL` for deploy. */
  siteUrl: getSiteUrl(),
  useInMemoryDb: process.env.USE_IN_MEMORY_DB === 'true',
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
