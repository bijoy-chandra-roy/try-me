import mongoose from 'mongoose';
import { loadEnvConfig } from '@next/env';
import { productRepository } from '../src/server/features/products/product.repository';
import { SEED_PRODUCTS } from '../src/server/db/seed-data';

loadEnvConfig(process.cwd());

async function seed() {
  const { config } = await import('../src/server/config');
  await mongoose.connect(config.mongodbUri);
  await productRepository.deleteAll();
  await productRepository.insertMany(SEED_PRODUCTS);
  console.log(`Seeded ${SEED_PRODUCTS.length} products`);
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
