'use client';

import Image from 'next/image';
import { GlassCard } from '@/shared/components/GlassCard';
import type { Product } from '@/shared/types';

interface ProductCardProps {
  product: Product;
  onTryOn: (product: Product) => void;
}

export function ProductCard({ product, onTryOn }: ProductCardProps) {
  return (
    <GlassCard hover className="group flex flex-col">
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {!product.inStock && (
          <span className="absolute left-3 top-3 rounded-full bg-sand-900/70 px-2.5 py-1 text-xs font-medium text-sand-100">
            Out of stock
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <span className="mb-1 inline-block rounded-full bg-clay-400/15 px-2 py-0.5 text-xs font-medium capitalize text-clay-600 dark:text-clay-400">
            {product.category}
          </span>
          <h3 className="font-serif text-lg font-semibold text-olive-700 dark:text-sand-100">
            {product.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-sand-600 dark:text-sand-300">
            {product.description}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-right text-lg font-semibold tabular-nums text-olive-600 dark:text-sand-200">
            ${product.price.toFixed(2)}
          </span>
          <button
            type="button"
            onClick={() => onTryOn(product)}
            disabled={!product.inStock}
            className="rounded-full bg-olive-600 px-4 py-2 text-sm font-medium text-sand-50 transition-colors hover:bg-olive-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Try On
          </button>
        </div>
      </div>
    </GlassCard>
  );
}
