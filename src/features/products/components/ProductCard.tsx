'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { GlassButton } from '@/shared/components/GlassButton';
import { GlassCard } from '@/shared/components/GlassCard';
import { Popover } from '@/shared/components/Popover';
import { Tooltip } from '@/shared/components/Tooltip';
import { useAuth, usePermission } from '@/shared/hooks/useAuth';
import { useSystemStatus } from '@/shared/hooks/useSystemStatus';
import { addToCart } from '@/features/cart/api/cart.api';
import { setCartStore } from '@/features/cart/hooks/useCart';
import { ApiError } from '@/shared/lib/api-client';
import type { Product } from '@/shared/types';

interface ProductCardProps {
  product: Product;
  onTryOn: (product: Product) => void;
}

export function ProductCard({ product, onTryOn }: ProductCardProps) {
  const isUnavailable = !product.inStock || product.stockQuantity <= 0;
  const { isAuthenticated } = useAuth();
  const hasTryOnPermission = usePermission('try_on');
  const canManageCart = usePermission('manage_cart');
  const canTryOn = !isAuthenticated || hasTryOnPermission;
  const { tryOnBlocked } = useSystemStatus();
  const tryOnDisabled = isUnavailable || tryOnBlocked || !canTryOn;

  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] ?? '');
  const [adding, setAdding] = useState(false);
  const [cartMessage, setCartMessage] = useState('');

  const tryOnTooltip = tryOnBlocked
    ? 'Try-on unavailable during maintenance'
    : isUnavailable
      ? 'This item is currently unavailable'
      : 'Preview on your photo';

  const needsSize = (product.sizes?.length ?? 0) > 0;
  const cartDisabled = isUnavailable || adding || (needsSize && !selectedSize);

  async function handleAddToCart() {
    if (!isAuthenticated) {
      window.location.href = `/login?callbackUrl=${encodeURIComponent('/')}`;
      return;
    }
    if (!canManageCart) {
      setCartMessage('You cannot add items to cart');
      return;
    }
    setAdding(true);
    setCartMessage('');
    try {
      const cart = await addToCart({
        productId: product._id,
        quantity: 1,
        size: needsSize ? selectedSize : undefined,
      });
      setCartStore(cart);
      setCartMessage('Added to cart');
    } catch (err) {
      setCartMessage(err instanceof ApiError ? err.message : 'Could not add to cart');
    } finally {
      setAdding(false);
    }
  }

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
        {!isUnavailable && product.stockQuantity <= 5 && (
          <span className="chip absolute left-3 top-3 bg-olive-700/80 text-sand-100">
            Only {product.stockQuantity} left
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
            {(product.reviewCount ?? 0) > 0 && (
              <p className="mt-1 text-xs text-olive-600 dark:text-sand-300">
                ★ {product.averageRating?.toFixed(1)} · {product.reviewCount} review
                {(product.reviewCount ?? 0) === 1 ? '' : 's'}
              </p>
            )}
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
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`chip-size transition ${
                  selectedSize === size
                    ? 'bg-olive-700 text-sand-100 dark:bg-sand-100 dark:text-olive-800'
                    : ''
                }`}
              >
                {size}
              </button>
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

        <div className="mt-auto space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-lg font-semibold tabular-nums text-olive-600 dark:text-sand-200">
              ${product.price.toFixed(2)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Tooltip content={tryOnTooltip}>
              <span className={tryOnDisabled ? 'opacity-40' : ''}>
                <GlassButton
                  className="w-full text-sm"
                  onClick={() => onTryOn(product)}
                  disabled={tryOnDisabled}
                >
                  Try On
                </GlassButton>
              </span>
            </Tooltip>
            {isAuthenticated ? (
              <GlassButton
                className="w-full text-sm"
                onClick={handleAddToCart}
                disabled={cartDisabled}
              >
                {adding ? 'Adding…' : 'Add to cart'}
              </GlassButton>
            ) : (
              <Link href={`/login?callbackUrl=${encodeURIComponent('/')}`}>
                <GlassButton className="w-full text-sm" disabled={isUnavailable}>
                  Add to cart
                </GlassButton>
              </Link>
            )}
          </div>
          {cartMessage && (
            <p className="text-xs text-olive-600 dark:text-sand-300">{cartMessage}</p>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
