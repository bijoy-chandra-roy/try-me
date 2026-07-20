'use client';

import Image from 'next/image';
import { GlassButton } from '@/shared/components/GlassButton';
import { GlassCard } from '@/shared/components/GlassCard';
import { Popover } from '@/shared/components/Popover';
import { Tooltip } from '@/shared/components/Tooltip';
import { useAuth, usePermission } from '@/shared/hooks/useAuth';
import { useSystemStatus } from '@/shared/hooks/useSystemStatus';
import type { Product } from '@/shared/types';

interface ProductCardProps {
  product: Product;
  onTryOn: (product: Product) => void;
}

export function ProductCard({ product, onTryOn }: ProductCardProps) {
  const isUnavailable = !product.inStock;
  const { isAuthenticated } = useAuth();
  const hasTryOnPermission = usePermission('try_on');
  const canTryOn = !isAuthenticated || hasTryOnPermission;
  const { tryOnBlocked } = useSystemStatus();
  const tryOnDisabled = isUnavailable || tryOnBlocked || !canTryOn;

  const tryOnTooltip = tryOnBlocked
    ? 'Try-on unavailable during maintenance'
    : isUnavailable
      ? 'This item is currently unavailable'
      : 'Preview on your photo';

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

        {(product.sizes ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {(product.sizes ?? []).map((size) => (
              <span key={size} className="chip-size">
                {size}
              </span>
            ))}
          </div>
        )}

        {(product.customFields ?? []).map((field, index) => {
          const options = field.options ?? [];
          if (options.length === 0) return null;
          return (
            <div key={`${field.label}-${index}`} className="space-y-1">
              {field.label ? (
                <p className="text-xs font-medium text-olive-700 dark:text-sand-200">
                  {field.label}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-1.5">
                {options.map((option) => (
                  <span key={option} className="chip-size">
                    {option}
                  </span>
                ))}
              </div>
            </div>
          );
        })}

        <div className="mt-auto grid grid-cols-[1fr_auto] items-center gap-3">
          <span className="text-right text-lg font-semibold tabular-nums text-olive-600 dark:text-sand-200">
            ${product.price.toFixed(2)}
          </span>
          <Tooltip content={tryOnTooltip}>
            <span className={`action-reveal ${tryOnDisabled ? 'sm:opacity-40' : ''}`}>
              <GlassButton onClick={() => onTryOn(product)} disabled={tryOnDisabled}>
                Try On
              </GlassButton>
            </span>
          </Tooltip>
        </div>
      </div>
    </GlassCard>
  );
}
