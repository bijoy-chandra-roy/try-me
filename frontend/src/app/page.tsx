'use client';

import { useState } from 'react';
import { CategoryFilter } from '@/features/products/components/CategoryFilter';
import { ProductGrid } from '@/features/products/components/ProductGrid';
import { useProducts } from '@/features/products/hooks/useProducts';
import { TryOnModal } from '@/features/try-on/components/TryOnModal';
import type { Product } from '@/shared/types';

export default function HomePage() {
  const { products, category, setCategory, loading, error } = useProducts();
  const [tryOnProduct, setTryOnProduct] = useState<Product | null>(null);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <section className="mb-10">
        <h2 className="font-serif text-4xl font-semibold tracking-tight text-olive-700 dark:text-sand-100">
          Curated Essentials
        </h2>
        <p className="mt-2 max-w-xl text-sand-600 dark:text-sand-300">
          Upload a photo and preview any piece on yourself with our virtual try-on.
          Resilient by design — always returns a result.
        </p>
      </section>

      <section className="mb-8">
        <CategoryFilter selected={category} onChange={setCategory} />
      </section>

      {loading && (
        <div className="flex items-center justify-center py-24">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-olive-600 border-t-transparent" />
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          {error}. Make sure the backend is running on port 5000.
        </div>
      )}

      {!loading && !error && (
        <ProductGrid products={products} onTryOn={setTryOnProduct} />
      )}

      <TryOnModal product={tryOnProduct} onClose={() => setTryOnProduct(null)} />
    </div>
  );
}
