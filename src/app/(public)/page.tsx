'use client';

import { useState } from 'react';
import { CategoryFilter } from '@/features/products/components/CategoryFilter';
import { ProductGrid } from '@/features/products/components/ProductGrid';
import { useProducts } from '@/features/products/hooks/useProducts';
import { OnboardingTour } from '@/shared/components/OnboardingTour';
import { MaintenanceBanner } from '@/shared/components/MaintenanceBanner';
import { TryOnModal } from '@/features/try-on/components/TryOnModal';
import { useSystemStatus } from '@/shared/hooks/useSystemStatus';
import type { Product } from '@/shared/types';

export default function HomePage() {
  const { products, category, setCategory, loading, error } = useProducts();
  const [tryOnProduct, setTryOnProduct] = useState<Product | null>(null);
  const { tryOnBlocked, guestTryOnLimit } = useSystemStatus();

  function handleTryOn(product: Product) {
    if (tryOnBlocked) return;
    setTryOnProduct(product);
  }

  return (
    <>
      <MaintenanceBanner />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <section className="mb-10">
          <h2 className="font-serif text-4xl font-semibold tracking-tight text-olive-700 dark:text-sand-100">
            Curated Essentials
          </h2>
          <p className="mt-2 max-w-xl text-sand-600 dark:text-sand-300">
            Upload a photo and preview any piece on yourself with our virtual try-on.
            Resilient by design — always returns a result.
            {!tryOnBlocked && (
              <span className="block mt-1 text-sm text-muted-subtle">
                Guests: {guestTryOnLimit} try-ons per hour. Sign in for unlimited access.
              </span>
            )}
          </p>
        </section>

        <section className="mb-8" data-onboard="filter">
          <CategoryFilter selected={category} onChange={setCategory} />
        </section>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-olive-600 border-t-transparent" />
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-300">
            {error}. Make sure the development server is running.
          </div>
        )}

        {!loading && !error && (
          <div data-onboard="grid">
            <ProductGrid products={products} onTryOn={handleTryOn} />
          </div>
        )}

        <TryOnModal product={tryOnProduct} onClose={() => setTryOnProduct(null)} />
        <OnboardingTour />
      </div>
    </>
  );
}
