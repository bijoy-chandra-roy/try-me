import mongoose from 'mongoose';
import type { MongoMemoryServer } from 'mongodb-memory-server';
import { assertSafeProductionConfig, config } from '@/server/config';
import { productRepository } from '@/server/features/products/product.repository';
import { SEED_PRODUCTS } from '@/server/db/seed-data';
import { seedUsersIfEmpty } from '@/server/db/seed-users';

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

let memoryServer: MongoMemoryServer | null = null;

async function seedIfEmpty() {
  const existing = await productRepository.findAll();
  if (existing.length === 0) {
    await productRepository.insertMany(SEED_PRODUCTS);
    console.log(`Seeded ${SEED_PRODUCTS.length} products`);
  }
}

export async function connectDatabase() {
  assertSafeProductionConfig();

  if (global.mongooseCache?.conn) {
    return global.mongooseCache.conn;
  }

  if (!global.mongooseCache) {
    global.mongooseCache = { conn: null, promise: null };
  }

  if (!global.mongooseCache.promise) {
    global.mongooseCache.promise = (async () => {
      let uri = config.mongodbUri;

      if (config.useInMemoryDb) {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create();
        uri = memoryServer.getUri();
        console.log('Using in-memory MongoDB (USE_IN_MEMORY_DB=true)');
      }

      const connection = await mongoose.connect(uri);
      console.log('MongoDB connected');

      if (config.useInMemoryDb) {
        await seedIfEmpty();
        await seedUsersIfEmpty();
      }

      return connection;
    })();
  }

  global.mongooseCache.conn = await global.mongooseCache.promise;
  return global.mongooseCache.conn;
}

export async function ensureDbConnection() {
  await connectDatabase();
}
