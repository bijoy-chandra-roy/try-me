'use client';

import { useEffect, useMemo, useState } from 'react';
import { CatalogToolbar } from '@/features/products/components/CatalogToolbar';
import { ProductGrid } from '@/features/products/components/ProductGrid';
import { useProducts } from '@/features/products/hooks/useProducts';
import {
  DEFAULT_CATALOG_FILTERS,
  filterAndSortProducts,
  readStoredLayout,
  storeLayout,
  type CatalogFilterState,
} from '@/features/products/lib/catalog-filters';
import { MaintenanceBanner } from '@/shared/components/MaintenanceBanner';
import { ProductGridSkeleton } from '@/shared/components/Skeleton';
import { TryOnModal } from '@/features/try-on/components/TryOnModal';
import { useSystemStatus } from '@/shared/hooks/useSystemStatus';
import type { Product } from '@/shared/types';

interface CatalogHomeProps {
  initialProducts: Product[];
  initialMaintenanceMode?: boolean;
  initialGuestTryOnLimit?: number;
}

export function CatalogHome({
  initialProducts,
  initialMaintenanceMode = false,
  initialGuestTryOnLimit = 3,
}: CatalogHomeProps) {
  const { products, loading, error } = useProducts(undefined, initialProducts);
  const [filters, setFilters] = useState<CatalogFilterState>(DEFAULT_CATALOG_FILTERS);
  const [tryOnProduct, setTryOnProduct] = useState<Product | null>(null);
  const { tryOnBlocked, guestTryOnLimit } = useSystemStatus({
    maintenanceMode: initialMaintenanceMode,
    guestTryOnLimit: initialGuestTryOnLimit,
  });

  useEffect(() => {
    setFilters((prev) => ({ ...prev, layout: readStoredLayout() }));
  }, []);

  const visibleProducts = useMemo(
    () => filterAndSortProducts(products, filters),
    [products, filters]
  );

  function handleFiltersChange(next: CatalogFilterState) {
    if (next.layout !== filters.layout) {
      storeLayout(next.layout);
    }
    setFilters(next);
  }

  function handleResetFilters() {
    setFilters((prev) => ({
      ...DEFAULT_CATALOG_FILTERS,
      layout: prev.layout,
    }));
  }

  function handleTryOn(product: Product) {
    if (tryOnBlocked) return;
    setTryOnProduct(product);
  }

  return (
    <>
      <MaintenanceBanner initialMaintenanceMode={initialMaintenanceMode} />
      <div className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-10">
        <section className="mb-8 sm:mb-10">
          <h2 className="font-serif text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
            Curated Essentials
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted sm:text-base">
            Upload a photo and preview any piece on yourself with our virtual try-on.
            Resilient by design — always returns a result.
            <span
              className={`mt-1 block min-h-[1.25rem] text-sm text-muted-subtle ${
                tryOnBlocked ? 'invisible' : ''
              }`}
            >
              Guests: {guestTryOnLimit} try-ons per hour. Sign in for unlimited access.
            </span>
          </p>
        </section>

        <section className="mb-6 sm:mb-8">
          <CatalogToolbar
            filters={filters}
            resultCount={visibleProducts.length}
            onChange={handleFiltersChange}
            onReset={handleResetFilters}
          />
        </section>

        {error && (
          <div
            className="mb-6 rounded-element border px-4 py-3 text-sm font-medium"
            style={{
              borderColor: 'var(--color-error-muted)',
              background: 'var(--color-error-muted)',
              color: 'var(--color-error)',
            }}
          >
            {error}. Make sure the development server is running.
          </div>
        )}

        {loading ? (
          <ProductGridSkeleton layout={filters.layout} />
        ) : (
          <ProductGrid
            products={visibleProducts}
            onTryOn={handleTryOn}
            layout={filters.layout}
          />
        )}

        <TryOnModal product={tryOnProduct} onClose={() => setTryOnProduct(null)} />
      </div>
    </>
  );
}
