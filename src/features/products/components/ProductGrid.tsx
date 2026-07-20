'use client';

import { ProductCard } from '@/features/products/components/ProductCard';
import {
  catalogGridClass,
  type CatalogLayout,
} from '@/features/products/lib/catalog-filters';
import type { Product } from '@/shared/types';

interface ProductGridProps {
  products: Product[];
  onTryOn: (product: Product) => void;
  layout?: CatalogLayout;
}

export function ProductGrid({
  products,
  onTryOn,
  layout = 'grid',
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-container border border-dashed border-border px-4 py-16 text-center">
        <p className="text-muted">No products match your search or filters.</p>
        <p className="mt-1 text-sm text-muted-subtle">
          Try a different query, category, or clear filters.
        </p>
      </div>
    );
  }

  return (
    <div className={catalogGridClass(layout)}>
      {products.map((product, index) => (
        <ProductCard
          key={product._id}
          product={product}
          onTryOn={onTryOn}
          layout={layout}
          priority={index < 6}
        />
      ))}
    </div>
  );
}
