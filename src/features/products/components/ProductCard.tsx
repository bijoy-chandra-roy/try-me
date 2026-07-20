'use client';

import Image from 'next/image';
import { GlassButton } from '@/shared/components/GlassButton';
import { GlassCard } from '@/shared/components/GlassCard';
import { Popover } from '@/shared/components/Popover';
import { Tooltip } from '@/shared/components/Tooltip';
import type { Product } from '@/shared/types';

interface ProductCardProps {
  product: Product;
  onTryOn: (product: Product) => void;
}

export function ProductCard({ product, onTryOn }: ProductCardProps) {
  const isUnavailable = !product.inStock;

  return (
    <GlassCard
      hover
      className={`group flex flex-col ${isUnavailable ? 'row-dimmed' : ''}`}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {isUnavailable && (
          <span className="chip absolute left-3 top-3 bg-sand-900/75 text-sand-100">
            Out of stock
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <span className="chip-category mb-1">{product.category}</span>
            <h3 className="truncate font-serif text-lg font-semibold text-olive-700 dark:text-sand-100">
              {product.name}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm text-sand-600 dark:text-sand-300">
              {product.description}
            </p>
          </div>
          <Popover
            label="More options"
            items={[
              {
                label: 'Copy product name',
                onClick: () => navigator.clipboard.writeText(product.name),
              },
              {
                label: 'Copy price',
                onClick: () => navigator.clipboard.writeText(`$${product.price.toFixed(2)}`),
              },
            ]}
          />
        </div>

        {product.sizes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {product.sizes.map((size) => (
              <span key={size} className="chip-size">
                {size}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto grid grid-cols-[1fr_auto] items-center gap-3">
          <span className="text-right text-lg font-semibold tabular-nums text-olive-600 dark:text-sand-200">
            ${product.price.toFixed(2)}
          </span>
          <Tooltip content={isUnavailable ? 'This item is currently unavailable' : 'Preview on your photo'}>
            <span className={`action-reveal ${isUnavailable ? 'sm:opacity-40' : ''}`}>
              <GlassButton onClick={() => onTryOn(product)} disabled={isUnavailable}>
                Try On
              </GlassButton>
            </span>
          </Tooltip>
        </div>
      </div>
    </GlassCard>
  );
}
