import { ensureDbConnection } from '@/server/db/connection';
import { productService } from '@/server/features/products/product.service';
import { unstable_cache } from '@/server/lib/cache';
import type { ProductCategory } from '@/shared/types';

async function loadProducts(category?: ProductCategory) {
  await ensureDbConnection();
  return productService.getProducts(category ? { category } : {});
}

/** Cached catalog read — shared across layout/page/metadata in one request. */
export function getCachedProducts(category?: ProductCategory) {
  const key = category ? `products:${category}` : 'products:all';
  return unstable_cache(
    () => loadProducts(category),
    [key],
    { revalidate: 60 * 60 * 2, tags: ['products'] }
  )();
}
