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
      <div className="mx-auto max-w-content px-6 py-10">
        <section className="mb-10">
          <h2 className="font-serif text-4xl font-semibold tracking-tight text-primary">
            Curated Essentials
          </h2>
          <p className="mt-2 max-w-xl text-muted">
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
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-accent-fill)] border-t-transparent" />
          </div>
        )}

        {error && (
          <div
            className="rounded-element border px-4 py-3 text-sm font-medium"
            style={{
              borderColor: 'var(--color-error-muted)',
              background: 'var(--color-error-muted)',
              color: 'var(--color-error)',
            }}
          >
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
