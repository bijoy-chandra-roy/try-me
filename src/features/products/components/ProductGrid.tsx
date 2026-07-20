'use client';

import { ProductCard } from '@/features/products/components/ProductCard';
import type { Product } from '@/shared/types';

interface ProductGridProps {
  products: Product[];
  onTryOn: (product: Product) => void;
}

export function ProductGrid({ products, onTryOn }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-container border border-dashed border-border py-16 text-center">
        <p className="text-muted">No products found in this category.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product, index) => (
        <ProductCard
          key={product._id}
          product={product}
          onTryOn={onTryOn}
          priority={index < 6}
        />
      ))}
    </div>
  );
}
