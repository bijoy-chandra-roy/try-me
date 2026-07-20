import path from 'path';

export const config = {
  useInMemoryDb: process.env.USE_IN_MEMORY_DB === 'true',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/tryme',
  imgbbApiKey: process.env.IMGBB_API_KEY || '',
  vtoApiUrl:
    process.env.VTO_API_URL || 'https://yisol-idm-vton.hf.space/api/predict',
  vtoTimeoutMs: parseInt(process.env.VTO_TIMEOUT_MS || '10000', 10),
  fallbackImagePath: path.join(process.cwd(), 'cache/fallback-vto-result.jpg'),
};
