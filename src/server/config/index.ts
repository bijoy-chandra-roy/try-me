import path from 'path';

export const config = {
  useInMemoryDb: process.env.USE_IN_MEMORY_DB === 'true',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/tryme',
  imgbbApiKey: process.env.IMGBB_API_KEY || '',
  vtoApiUrl:
    process.env.VTO_API_URL || 'https://yisol-idm-vton.hf.space/call/tryon',
  vtoTimeoutMs: parseInt(process.env.VTO_TIMEOUT_MS || '300000', 10),
  hfToken: process.env.HF_TOKEN || '',
  fallbackImagePath: path.join(process.cwd(), 'cache/fallback-vto-result.jpg'),
  /** Payment provider: `cod` (default) or `stripe` (not configured yet). */
  paymentProvider: (process.env.PAYMENT_PROVIDER || 'cod').toLowerCase(),
};
