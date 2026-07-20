require('dotenv').config();
const path = require('path');

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/tryme',
  imgbbApiKey: process.env.IMGBB_API_KEY || '',
  vtoApiUrl: process.env.VTO_API_URL || 'https://yisol-idm-vton.hf.space/api/predict',
  vtoTimeoutMs: parseInt(process.env.VTO_TIMEOUT_MS, 10) || 10000,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  fallbackImagePath: path.join(__dirname, '../../cache/fallback-vto-result.jpg'),
};

module.exports = config;
